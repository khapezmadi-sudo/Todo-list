import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Bell,
  MoreHorizontal,
  Inbox,
  ChevronDown,
} from "lucide-react";
import type { Task } from "@/pages/HomePage";
import { useForm } from "react-hook-form";
import {
  taskSchema,
  type TaskSchemaData,
} from "../CreateTask/CreateTaskDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTask } from "@/services/taskService";
import { toast } from "sonner";
import { TaskPriorityDropdown } from "../CreateTask/TaskPriorityDropdown";

interface TaskItemEditProps {
  task: Task;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskItemEdit: React.FC<TaskItemEditProps> = ({ task, setIsEditing }) => {
  const [priority, setPriority] = React.useState<number>(task.priority);
  const { register, handleSubmit } = useForm<TaskSchemaData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { description: task.description, text: task.text },
  });

  const onSubmit = async (data: TaskSchemaData): Promise<void> => {
    const myPromise = updateTask(task.id, {
      ...data,
      completed: task.completed,
      isImportant: task.isImportant,
      priority: priority,
    });

    toast.promise(myPromise, {
      loading: "Обновление...",
      success: "Задача обновлена!",
      error: "Ошибка при сохранении",
    });

    try {
      await myPromise;
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="group p-3 border-b bg-gray-50 transition hover:bg-gray-100 relative">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <Input
            {...register("text")}
            placeholder="Название задачи"
            className="border-none bg-transparent shadow-none 
          text-xl! font-bold tracking-tight
          focus-visible:ring-0 px-0 h-8
          placeholder:text-muted-foreground"
          />

          {/* Description */}
          <Input
            {...register("description")}
            placeholder="Добавить описание..."
            className="border-none bg-transparent shadow-none 
          text-sm! text-muted-foreground
          focus-visible:ring-0 px-0 h-6
          placeholder:text-muted-foreground"
          />

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-7 text-xs font-normal"
            >
              <Calendar className="mr-1.5 h-3 w-3" />
              Срок
            </Button>

            <TaskPriorityDropdown
              setPriority={setPriority}
              priority={priority}
            />

            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-7 text-xs font-normal"
            >
              <Bell className="mr-1.5 h-3 w-3" />
              Напоминание
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              type="button"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              type="button"
              size="sm"
              className="px-1 h-7 text-xs text-muted-foreground font-normal"
            >
              <Inbox className="mr-1.5 h-3.5 w-3.5" />
              Входящие
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>

            <div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-7 px-4 text-xs font-normal mr-2"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                type="submit"
                className="h-8 px-4 text-xs font-medium 
            bg-(--button-color) 
            hover:bg-(--button-color)/90 
            text-white"
              >
                Сохранить изменения
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(TaskItemEdit);
