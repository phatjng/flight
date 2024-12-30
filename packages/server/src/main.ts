import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import {
  type SocketPayload,
  type TransportPayload,
  type TransportResponse,
} from "flow";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { WSContext } from "hono/ws";
import { DateTime } from "luxon";

const app = new Hono();

app.use("/*", cors());

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const organizations = new Map<string, Map<string, WSContext>>();

app.get("/", (c) => {
  return c.json({
    success: true,
  });
});

app.get("/bootstrap", (c) => {
  const createdAt = DateTime.fromObject(
    {
      year: 2024,
      month: 12,
      day: 14,
    },
    {
      zone: "America/Los_Angeles",
    },
  ).toISO() as string;
  const updatedAt = DateTime.now().toISO();

  const sampleTasks = [
    {
      id: "47bd2d36-9077-4053-92cd-c36ce8ae89d9",
      title: "Browse Flight source code",
      isCompleted: false,
      createdAt: createdAt,
      updatedAt: updatedAt,
    },
    {
      id: "ca9b1c1c-ad5a-4171-9427-d770c452c61f",
      title: "Deploy Flight to Vercel",
      isCompleted: false,
      createdAt: createdAt,
      updatedAt: updatedAt,
    },
  ];

  // const sampleTasks = Array.from({ length: 100 }, (_, i) => {
  //   return {
  //     id: crypto.randomUUID().toString(),
  //     title: `Task ${i + 1}`,
  //     isCompleted: false,
  //     createdAt: createdAt,
  //     updatedAt: updatedAt,
  //   };
  // });

  return c.json({
    data: sampleTasks,
  });
});

app.get(
  "/sync/:organizationId",
  upgradeWebSocket((c) => {
    const { organizationId } = c.req.param();

    let clientId = crypto.randomUUID().toString();

    return {
      onOpen: (_, ws) => {
        if (!organizations.has(organizationId)) {
          organizations.set(organizationId, new Map());
        }

        organizations.get(organizationId)!.set(clientId, ws);
      },
      onMessage: (event, _) => {
        if (typeof event.data === "string") {
          const payload: SocketPayload = JSON.parse(event.data);

          switch (payload.type) {
            case "transport":
              const data = payload as TransportPayload;
              console.dir(data, { depth: null });

              // Broadcast response to all clients within the organization
              const response: TransportResponse = {
                type: "transport_response",
                delta: data.delta,
              };

              const clients = organizations.get(organizationId)!;
              for (const [_, client] of clients) {
                client.send(JSON.stringify(response));
              }

              break;
            default:
              console.error("Unknown payload type");
          }
        }
      },
      onClose: () => {
        if (organizations.has(organizationId)) {
          organizations.get(organizationId)!.delete(clientId!);
        }
      },
    };
  }),
);

const server = serve({
  fetch: app.fetch,
  port: 8080,
});
injectWebSocket(server);
