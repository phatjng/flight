import type { FlowModels } from "./client";
import { EventEmitter } from "./event-emitter";
import type { IDBStorage } from "./idb-storage";
import type { Socket } from "./socket";
import type { Snapshot } from "./transaction";

interface ModelManagerOptions {
  storage: IDBStorage;
  socket: Socket;
  models: FlowModels;
}

export class ModelManager extends EventEmitter {
  private _storage: IDBStorage;
  private _socket: Socket;
  private _models: FlowModels;

  constructor(options: ModelManagerOptions) {
    super();

    this._storage = options.storage;
    this._socket = options.socket;
    this._models = options.models;

    // Listen for deltas to apply from socket response
    this._socket.on("apply_delta", async (snapshot: Snapshot) => {
      const model = this._models[snapshot.modelKey];
      if (!model) {
        console.error(`Unknown model key "${snapshot.modelKey}"`);
        return;
      }

      switch (snapshot.op) {
        case "insert":
          try {
            // First, insert the model into the local database
            await this._storage.db.put(model.modelKey, {
              id: snapshot.modelId,
              ...snapshot.fields,
            });

            // Then, update the MobX store
            if (!model.raw.has(snapshot.modelId)) {
              model.insert({
                id: snapshot.modelId,
                ...snapshot.fields,
              });
            }
          } catch (e) {
            console.error("Failed to insert model");
          }

          break;
        case "update":
          const currentSnapshot = await this._storage.db.get(
            model.modelKey,
            snapshot.modelId,
          );

          if (!currentSnapshot) {
            console.error("Failed to retrieve model");
            break;
          }

          try {
            await this._storage.db.put(model.modelKey, {
              id: snapshot.modelId,
              ...currentSnapshot,
              ...snapshot.fields,
            });

            model.update({
              id: snapshot.modelId,
              ...snapshot.fields,
            });
          } catch (e) {
            console.error("Failed to update model");
          }

          break;
        case "delete":
          try {
            await this._storage.db.delete(model.modelKey, snapshot.modelId);

            model.delete(snapshot.modelId);
          } catch (e) {
            console.error("Failed to delete model");
          }

          break;
        default:
          console.error("Unknown snapshot operation");
      }
    });
  }
}
