import { ulid } from "ulidx";
import type { Atomic, FlowModel } from "./model";
import type { Transport } from "./transport";

export interface Snapshot {
  modelKey: string;
  modelId: string;
  fields: Record<string, any>;
  op: "insert" | "update" | "delete";
}

export interface Delta {
  id: string;
  changes: Snapshot[];
}

export class Transaction {
  private _isInTransaction = false;
  private _snapshots: Snapshot[] = [];
  private _transport: Transport;

  constructor(options: { transport: Transport }) {
    this._transport = options.transport;
  }

  private async _commit() {
    // The snapshots are included in the delta to be sent to the server
    // [snapshots] --> [delta] --> [server]
    const delta: Delta = {
      id: ulid(),
      changes: this._snapshots,
    };

    // Pass the delta to the transport layer
    await this._transport.stageDelta(delta);

    // Reset snapshots for next commit
    this._snapshots = [];
  }

  public async insert<Data extends Atomic>(model: FlowModel<Data>, data: Data) {
    // Optimistically insert the data into the model
    model.insert(data);

    // Prepare to stage the transaction
    const { id, ...fields } = data;

    const snapshot: Snapshot = {
      modelKey: model.modelKey,
      modelId: id,
      fields: fields,
      op: "insert",
    };
    this._snapshots.push(snapshot);

    // When not in a transaction, directly commit the snapshot
    if (!this._isInTransaction) {
      await this._commit();
    }
  }

  public async update<Data extends Atomic>(
    model: FlowModel<Data>,
    data: Partial<Data> & { id: Atomic["id"] },
  ) {
    model.update(data);

    const { id, ...fields } = data;

    const snapshot: Snapshot = {
      modelKey: model.modelKey,
      modelId: id,
      fields: fields,
      op: "update",
    };
    this._snapshots.push(snapshot);

    if (!this._isInTransaction) {
      await this._commit();
    }
  }

  public async delete(model: FlowModel<any>, id: Atomic["id"]) {
    model.delete(id);

    const snapshot: Snapshot = {
      modelKey: model.modelKey,
      modelId: id,
      fields: {},
      op: "delete",
    };
    this._snapshots.push(snapshot);

    if (!this._isInTransaction) {
      await this._commit();
    }
  }

  public async transact(
    fn: (tx: Omit<Transaction, "transact">) => Promise<void>,
  ) {
    if (this._isInTransaction) return;

    // Start a new transaction
    this._isInTransaction = true;

    try {
      await fn(this);
      await this._commit();
    } catch (e) {
      // TODO: Handle error
    } finally {
      this._isInTransaction = false;
    }
  }
}
