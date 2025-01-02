import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import type { IDBStorage } from "./idb-storage";

export type Atomic = {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};

export interface FlowModelOptions<Data extends Atomic> {
  modelKey: string;
  indexes?: (keyof Data)[];
}

export class FlowModel<Data extends Atomic> {
  public modelKey: string;
  public modelIndexes: (keyof Data)[] | undefined;

  public raw = new Map<string, Data>();

  constructor(options: FlowModelOptions<Data>) {
    makeObservable(this, {
      raw: observable,
      elements: computed,
      init: action,
      insert: action,
      update: action,
      delete: action,
    });

    this.modelKey = options.modelKey;
    this.modelIndexes = options.indexes;
  }

  // Return all elements of the model in memory as an array
  public get elements() {
    return Array.from(this.raw.values());
  }

  public async init({
    storage,
    shouldLoadFromRemote,
  }: {
    storage: IDBStorage;
    shouldLoadFromRemote: boolean;
  }) {
    if (shouldLoadFromRemote) {
      // Load from user-defined bootstrap function
      const bootstrapData = await this.bootstrap();

      if (bootstrapData.length > 0) {
        const dataMap = new Map<string, Data>();

        const tx = storage.db.transaction(this.modelKey, "readwrite");

        for (const data of bootstrapData) {
          await tx.store.put(data);
          dataMap.set(data.id, data);
        }

        await tx.done;

        runInAction(() => {
          this.raw = dataMap;
        });
      }
    } else {
      // Load from local storage
      const dataMap = new Map<string, Data>();

      const tx = storage.db.transaction(this.modelKey, "readonly");

      for await (const cursor of tx.store) {
        const datum: Data = cursor.value;

        dataMap.set(datum.id, datum);
      }

      await tx.done;

      runInAction(() => {
        this.raw = dataMap;
      });
    }
  }

  // Bootstrap the model with initial data
  public async bootstrap(): Promise<Data[]> {
    return [];
  }

  // Define actions to be performed on the model.
  // These actions will be executed in a transaction.
  public insert(data: Data) {
    this.raw.set(data.id, data);
  }

  public update(data: Partial<Data> & { id: Atomic["id"] }) {
    const existingData = this.raw.get(data.id);
    if (existingData) {
      this.raw.set(data.id, {
        ...existingData,
        ...data,
      });
    }
  }

  public delete(id: Atomic["id"]) {
    this.raw.delete(id);
  }
}
