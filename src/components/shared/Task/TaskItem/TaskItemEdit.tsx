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
import type { Task } from "@/types/task";
import { useForm } from "react-hook-form";
import {
  taskSchema,
  type TaskSchemaData,
} from "../CreateTask/CreateTaskDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTask } from "@/services/taskService";
import { toast } from "sonner";
import { TaskPriorityDropdown } from "../CreateTask/TaskPriorityDropdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Timestamp } from "firebase/firestore";

interface TaskItemEditProps {
  task: Task;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskItemEdit: React.FC<TaskItemEditProps> = ({ task, setIsEditing }) => {
  const [priority, setPriority] = React.useState<number>(task.priority);
  const { register, handleSubmit, setValue, watch } = useForm<TaskSchemaData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: task.description,
      text: task.text,
      dueDate: task.dueDate?.toDate ? task.dueDate.toDate() : null,
    },
  });

  const dueDate = watch("dueDate") ?? null;

  const dueDateLabel = React.useMemo(() => {
    if (!dueDate) return "Срок";
    return dueDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  }, [dueDate]);

  const onSubmit = async (data: TaskSchemaData): Promise<void> => {
    const myPromise = updateTask(task.id, {
      text: data.text,
      description: data.description,
      dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
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
    <div className="group p-3 border rounded-lg bg-background transition hover:bg-muted/40 relative">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="h-7 text-xs font-normal"
                >
                  <Calendar className="mr-1.5 h-3 w-3" />
                  {dueDateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <CalendarPicker
                    mode="single"
                    selected={dueDate ?? undefined}
                    onSelect={(date) =>
                      setValue("dueDate", date ?? null, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    initialFocus
                  />
                  {dueDate && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-normal"
                        onClick={() =>
                          setValue("dueDate", null, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        Убрать срок
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
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
