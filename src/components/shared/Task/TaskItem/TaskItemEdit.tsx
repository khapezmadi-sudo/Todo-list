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
import { useTranslation } from "react-i18next";

interface TaskItemEditProps {
  task: Task;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskItemEdit: React.FC<TaskItemEditProps> = ({ task, setIsEditing }) => {
  const [priority, setPriority] = React.useState<number>(task.priority);
  const { t } = useTranslation();
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);
  const [reminderTime, setReminderTime] = React.useState<string>("09:00");
  const { register, handleSubmit, setValue, watch } = useForm<TaskSchemaData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: task.description,
      text: task.text,
      dueDate: task.dueDate?.toDate ? task.dueDate.toDate() : null,
      reminderAt: task.reminderAt?.toDate ? task.reminderAt.toDate() : null,
    },
  });

  const dueDate = watch("dueDate") ?? null;
  const reminderAt = watch("reminderAt") ?? null;

  const dueDateLabel = React.useMemo(() => {
    if (!dueDate) return t("dueDate");
    return dueDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  }, [dueDate, t]);

  const reminderLabel = React.useMemo(() => {
    if (!reminderAt) return "Напоминание";
    const datePart = reminderAt.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
    const timePart = reminderAt.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  }, [reminderAt]);

  React.useEffect(() => {
    if (!reminderAt) return;
    const hh = String(reminderAt.getHours()).padStart(2, "0");
    const mm = String(reminderAt.getMinutes()).padStart(2, "0");
    setReminderTime(`${hh}:${mm}`);
  }, [reminderAt]);

  const onSubmit = async (data: TaskSchemaData): Promise<void> => {
    const myPromise = updateTask(task.id, {
      text: data.text,
      description: data.description,
      dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
      reminderAt: data.reminderAt ? Timestamp.fromDate(data.reminderAt) : null,
      completed: task.completed,
      isImportant: task.isImportant,
      priority: priority,
    });

    toast.promise(myPromise, {
      loading: t("toastUpdating"),
      success: t("toastTaskUpdated"),
      error: t("toastUpdateFailed"),
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
          text-xl! font-semibold tracking-tight text-foreground
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
                    onSelect={(date: Date | undefined) =>
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
                        {t("removeDueDate")}
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

            <Popover open={isReminderOpen} onOpenChange={setIsReminderOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="h-7 text-xs font-normal"
                >
                  <Bell className="mr-1.5 h-3 w-3" />
                  {reminderLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <CalendarPicker
                    mode="single"
                    selected={reminderAt ?? undefined}
                    onSelect={(date: Date | undefined) => {
                      if (!date) {
                        setValue("reminderAt", null, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                        return;
                      }

                      const [h, m] = reminderTime
                        .split(":")
                        .map((x) => Number(x));
                      const d = new Date(date);
                      d.setHours(Number.isFinite(h) ? h : 9);
                      d.setMinutes(Number.isFinite(m) ? m : 0);
                      d.setSeconds(0);
                      d.setMilliseconds(0);

                      setValue("reminderAt", d, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      setIsReminderOpen(false);
                    }}
                    initialFocus
                  />

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => {
                        const next = e.target.value;
                        setReminderTime(next);
                        if (!reminderAt) return;
                        const [h, m] = next.split(":").map((x) => Number(x));
                        const d = new Date(reminderAt);
                        d.setHours(Number.isFinite(h) ? h : d.getHours());
                        d.setMinutes(Number.isFinite(m) ? m : d.getMinutes());
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        setValue("reminderAt", d, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                      className="h-8 w-30 text-xs"
                    />
                    {reminderAt && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-normal"
                        onClick={() => {
                          setValue("reminderAt", null, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          setIsReminderOpen(false);
                        }}
                      >
                        Убрать
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
          <div className="flex flex-col gap-2 pt-2 border-t sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-9 px-4 text-xs font-normal sm:h-7 sm:mr-2"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                type="submit"
                className="h-9 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground sm:h-8"
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
