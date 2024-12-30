import { TRANSACTIONS_STORE_NAME } from "./constants";
import type { IDBStorage } from "./idb-storage";
import type { Socket, SOCKET_PAYLOAD_TYPES, SocketPayload } from "./socket";
import type { Delta } from "./transaction";

export interface TransportPayload extends SocketPayload {
  type: typeof SOCKET_PAYLOAD_TYPES.transport;
  delta: Delta;
}

export interface TransportResponse extends SocketPayload {
  type: typeof SOCKET_PAYLOAD_TYPES.transport_response;
  delta: Delta;
}

interface TransportOptions {
  socket: Socket;
  storage: IDBStorage;
}

export class Transport {
  private _socket: Socket;
  private _storage: IDBStorage;

  constructor(options: TransportOptions) {
    this._socket = options.socket;
    this._storage = options.storage;
  }

  public async transportDeltas() {
    const tx = this._storage.db.transaction(
      TRANSACTIONS_STORE_NAME,
      "readwrite",
    );

    for await (const cursor of tx.store) {
      const payload: TransportPayload = {
        type: "transport",
        delta: cursor.value,
      };

      // Send the delta to the server
      this._socket.send(JSON.stringify(payload));

      // Delete the delta after it has been sent
      cursor.delete();
    }

    await tx.done;
  }

  public async stageDelta(delta: Delta) {
    // Add the delta to the transactions store
    await this._storage.db.put(TRANSACTIONS_STORE_NAME, delta);

    await this.transportDeltas();
  }
}
