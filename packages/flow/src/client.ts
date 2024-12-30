import { IDBStorage } from "./idb-storage";
import type { FlowModel } from "./model";
import { ModelManager } from "./model-manager";
import { Socket } from "./socket";
import { Transaction } from "./transaction";
import { Transport } from "./transport";

export type FlowModels = Record<string, FlowModel<any>>;

interface FlowClientOptions<Models extends FlowModels> {
  namespace: string;
  models: Models;
  syncUrl: string;
}

export class FlowClient<Models extends FlowModels> {
  private _socket: Socket;
  private _storage: IDBStorage;
  private _transport: Transport;
  private _modelManager: ModelManager;

  public namespace: string;
  public models: Models;
  public tx: Transaction;

  constructor(options: FlowClientOptions<Models>) {
    this._socket = new Socket({
      syncUrl: options.syncUrl,
    });
    this._storage = new IDBStorage({
      namespace: options.namespace,
      models: options.models,
    });
    this._transport = new Transport({
      socket: this._socket,
      storage: this._storage,
    });
    this._modelManager = new ModelManager({
      socket: this._socket,
      models: options.models,
    });

    this.namespace = options.namespace;
    this.models = options.models;
    this.tx = new Transaction({
      transport: this._transport,
    });
  }

  public async init() {
    // Initialize IDB for KV storage
    await this._storage.init();

    // Initialize WebSocket for syncing
    this._socket.init();

    // Initialize all models
    await Promise.all(Object.values(this.models).map((model) => model.init()));
  }

  public close() {
    this._storage.close();
  }
}
