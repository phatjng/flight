import type { FlowModels } from "./client";
import { EventEmitter } from "./event-emitter";
import type { Socket } from "./socket";
import type { Snapshot } from "./transaction";

interface ModelManagerOptions {
  socket: Socket;
  models: FlowModels;
}

export class ModelManager extends EventEmitter {
  private _socket: Socket;
  private _models: FlowModels;

  constructor(options: ModelManagerOptions) {
    super();

    this._socket = options.socket;
    this._models = options.models;

    // Listen for deltas to apply from socket response
    this._socket.on("apply_delta", (snapshot: Snapshot) => {
      const model = this._models[snapshot.modelKey];
      if (!model) {
        console.error(`Unknown model key "${snapshot.modelKey}"`);
        return;
      }

      switch (snapshot.op) {
        case "insert":
          // It is possible that the snapshot already exists (optimistic update)
          // We'll just skip it if it does
          if (model.raw.has(snapshot.modelId)) {
            break;
          }

          model.insert({
            id: snapshot.modelId,
            ...snapshot.fields,
          });

          break;
        case "update":
          model.update({
            id: snapshot.modelId,
            ...snapshot.fields,
          });

          break;
        case "delete":
          model.delete(snapshot.modelId);

          break;
        default:
          console.error("Unknown snapshot operation");
      }
    });
  }
}
