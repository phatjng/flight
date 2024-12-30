import { FlowModel } from "flow";

export type Task = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export class TaskModel extends FlowModel<Task> {
  constructor() {
    super({
      modelKey: "task",
    });
  }

  // FIX: This should throw TS error since the expected return type is Promise<Task[]>
  public async bootstrap() {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/bootstrap`,
    );
    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch bootstrap data");
    }

    return responseJson.data; // Currently, `any`
  }
}
