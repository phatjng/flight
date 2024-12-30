import { createFileRoute, Navigate } from "@tanstack/react-router";
import { customAlphabet } from "nanoid";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 12);
  const organizationId = nanoid();

  return (
    <Navigate
      to="/$organizationId"
      params={{
        organizationId: organizationId,
      }}
    />
  );
}
