import { openDB, type IDBPDatabase } from "idb";
import type { FlowModels } from "./client";
import { METADATA_STORE_NAME, TRANSACTIONS_STORE_NAME } from "./constants";

const version = 1;

interface IDBStorageOptions {
  namespace: string;
  models: FlowModels;
}

export class IDBStorage {
  private _db: IDBPDatabase | null = null;
  private _namespace: string;
  private _models: FlowModels;

  constructor(options: IDBStorageOptions) {
    this._namespace = options.namespace;
    this._models = options.models;
  }

  public get db() {
    if (!this._db) throw new Error("IDBStorage not initialized");

    return this._db;
  }

  public async init() {
    if (this._db) throw new Error("IDBStorage already initialized");

    const name = `flow_${this._namespace}`;

    let models: FlowModels = {};
    for (const model of Object.values(this._models)) {
      const modelKey = model.modelKey; // TODO: Hash modelKey
      models[modelKey] = model;
    }

    let shouldLoadFromRemote = false;

    this._db = await openDB(name, version, {
      upgrade: (db) => {
        db.createObjectStore(METADATA_STORE_NAME);
        db.createObjectStore(TRANSACTIONS_STORE_NAME, {
          keyPath: "id",
        });

        for (const modelKey of Object.keys(models)) {
          const store = db.createObjectStore(modelKey, {
            keyPath: "id",
          });

          if (models[modelKey].modelIndexes) {
            for (const index of models[modelKey].modelIndexes) {
              const indexKey = String(index);
              store.createIndex(indexKey, indexKey, { unique: false });
            }
          }
        }

        // Should bootstrap from remote on first init
        shouldLoadFromRemote = true;
      },
    });

    return {
      shouldLoadFromRemote,
    };
  }

  public close() {
    if (!this._db) return;

    this._db.close();
  }
}
