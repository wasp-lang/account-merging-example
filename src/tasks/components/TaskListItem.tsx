import { twJoin } from "tailwind-merge";
import { updateTaskStatus } from "wasp/client/operations";
import { Task } from "wasp/entities";

interface TaskListItemProps {
  task: Task;
}

export function TaskListItem({ task }: TaskListItemProps) {
  async function setTaskDone(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    try {
      await updateTaskStatus({
        id: task.id,
        isDone: event.currentTarget.checked,
      });
    } catch (err: unknown) {
      window.alert(`Error while updating task: ${String(err)}`);
    }
  }

  return (
    <li>
      <label
        className={twJoin(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3",
          task.isDone
            ? "border-green-200 bg-green-50"
            : "border-gray-200 bg-white",
        )}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          checked={task.isDone}
          onChange={setTaskDone}
        />
        <div className="min-w-0 flex-1">
          <p
            className={twJoin(
              "text-sm",
              task.isDone ? "text-gray-500 line-through" : "text-gray-900",
            )}
          >
            {task.description}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
      </label>
    </li>
  );
}
