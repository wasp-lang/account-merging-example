import {
  deleteCompletedTasks,
  getTasks,
  useQuery,
} from "wasp/client/operations";
import { Button } from "../../shared/components/Button";
import { TaskListItem } from "./TaskListItem";

export function TaskList() {
  const { data: tasks, isLoading, isSuccess } = useQuery(getTasks);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="py-8 text-center text-red-500">Error loading tasks.</div>
    );
  }

  const completedTasks = tasks.filter((task) => task.isDone);

  async function handleDeleteCompletedTasks() {
    try {
      await deleteCompletedTasks();
    } catch (err: unknown) {
      window.alert(`Error while deleting tasks: ${String(err)}`);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No tasks yet. Add your first task above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex h-6 items-center justify-between">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        {completedTasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteCompletedTasks}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear completed ({completedTasks.length})
          </Button>
        )}
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskListItem task={task} key={task.id} />
        ))}
      </ul>

      <div className="pt-2 text-sm text-gray-500">
        {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
        {completedTasks.length > 0 && (
          <span> · {completedTasks.length} completed</span>
        )}
      </div>
    </div>
  );
}
