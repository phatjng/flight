export class EventEmitter {
  private _listeners = new Map<string, Array<(data: any) => void>>();

  constructor() {}

  public emit(event: string, data: any) {
    const fns = this._listeners.get(event) || [];

    for (const fn of fns) {
      fn(data);
    }
  }

  public on(event: string, fn: (data: any) => void) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }

    this._listeners.get(event)!.push(fn);
  }
}
