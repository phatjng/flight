import { EventEmitter } from "./event-emitter";
import type { TransportResponse } from "./transport";

export const SOCKET_PAYLOAD_TYPES = {
  transport: "transport",
  transport_response: "transport_response",
} as const;

export interface SocketPayload {
  type: (typeof SOCKET_PAYLOAD_TYPES)[keyof typeof SOCKET_PAYLOAD_TYPES];
}

interface SocketOptions {
  syncUrl: string;
}

export class Socket extends EventEmitter {
  private _ws: WebSocket | null = null;
  private _syncUrl: string;

  constructor(options: SocketOptions) {
    super();

    this._syncUrl = options.syncUrl;
  }

  public init() {
    if (this._ws) return;

    this._ws = new WebSocket(this._syncUrl);
    this._ws.onmessage = this.onMessage.bind(this);
  }

  public onMessage(event: MessageEvent) {
    if (typeof event.data === "string") {
      const response: SocketPayload = JSON.parse(event.data);

      switch (response.type) {
        case "transport_response":
          const data = response as TransportResponse;

          // Apply snapshots to local database
          for (const snapshot of data.delta.changes) {
            this.emit("apply_delta", snapshot);
          }

          break;
        default:
          console.error("Unknown response type");
      }
    }
  }

  public send(data: Parameters<WebSocket["send"]>[0]) {
    if (!this._ws) return;

    this._ws.send(data);
  }

  public close() {
    if (!this._ws) return;

    if (this._ws.readyState === WebSocket.OPEN) {
      this._ws.close();
    }
  }
}
