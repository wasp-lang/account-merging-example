import { type AuthUser } from "wasp/auth";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";

export const TasksPage = ({ user }: { user: AuthUser }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.username}!
        </h1>
        <p className="text-gray-600">Manage your tasks below</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <CreateTaskForm />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <TaskList />
        </div>
      </div>
    </div>
  );
};
