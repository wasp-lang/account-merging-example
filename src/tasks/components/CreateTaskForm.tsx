import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { createTask } from "wasp/client/operations";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";

interface CreateTaskFormValues {
  description: string;
}

export function CreateTaskForm() {
  const { handleSubmit, control, reset } = useForm<CreateTaskFormValues>({
    defaultValues: {
      description: "",
    },
  });

  const onSubmit: SubmitHandler<CreateTaskFormValues> = async (data, event) => {
    event?.stopPropagation();

    try {
      await createTask(data);
    } catch (err: unknown) {
      window.alert(`Error while creating task: ${String(err)}`);
    } finally {
      reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4"
    >
      <h2 className="text-xl font-semibold">Create a new task</h2>
      <div className="flex gap-2">
        <Controller
          name="description"
          control={control}
          rules={{
            required: { value: true, message: "Description is required" },
          }}
          render={({ field, fieldState }) => (
            <div className="flex-1">
              <input
                placeholder="What do I need to do?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...field}
              />
              {fieldState.error && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        <Button type="submit">Add Task</Button>
      </div>
    </form>
  );
}
