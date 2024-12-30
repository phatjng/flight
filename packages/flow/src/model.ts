import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

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

  public async init() {
    const bootstrapData = await this.bootstrap();

    if (bootstrapData.length > 0) {
      let bootstrapDataMap = new Map<string, Data>();
      for (const data of bootstrapData) {
        bootstrapDataMap.set(data.id, data);
      }

      runInAction(() => {
        this.raw = bootstrapDataMap;
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
