import type { Task } from "#/models/task";
import { useFlow } from "#/providers/flow";
import { DateTime } from "luxon";
import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import * as R from "remeda";
import { Checkbox } from "./ui/checkbox";

const TaskListItem = observer(({ task }: { task: Task }) => {
  const flow = useFlow();

  const toggleTaskComplete = async () => {
    await flow.tx.update(flow.models.task, {
      id: task.id,
      isCompleted: !task.isCompleted,
    });
  };

  return (
    <li className="hover:bg-sand-1 flex items-center gap-2 p-2 transition">
      <Checkbox checked={task.isCompleted} onChange={toggleTaskComplete} />

      <div className="flex w-full items-center justify-between">
        <span className={`${task.isCompleted && "text-sand-11 line-through"}`}>
          {task.title}
        </span>
        <span className="text-sand-11 text-sm">
          {DateTime.fromISO(task.createdAt).toFormat("LLL dd")}
        </span>
      </div>
    </li>
  );
});

const TaskList = observer(
  ({ label, tasks }: { label: string; tasks: Task[] }) => {
    return (
      <div className="flex flex-col divide-y">
        <span className="bg-sand-3 px-8 py-1 text-sm font-bold">{label}</span>

        {label === "In progress" && tasks.length === 0 ? (
          <span className="px-8 py-4">You are free to take it easy!</span>
        ) : (
          <ul className="divide-y">
            {R.sortBy(tasks, R.prop("createdAt")).map((task) => {
              return <TaskListItem key={task.id} task={task} />;
            })}
          </ul>
        )}
      </div>
    );
  },
);

export const InProgressTasksList = observer(() => {
  const flow = useFlow();
  const tasks = computed(() =>
    flow.models.task.elements.filter((task) => !task.isCompleted),
  ).get();

  return <TaskList label="In progress" tasks={tasks} />;
});

export const CompletedTasksList = observer(() => {
  const flow = useFlow();
  const tasks = computed(() =>
    flow.models.task.elements.filter((task) => task.isCompleted),
  ).get();

  return <TaskList label="Completed" tasks={tasks} />;
});
