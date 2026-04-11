import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { Edit2, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import TaskItemEdit from "./TaskItemEdit";
import { toast } from "sonner";
import ActionsDropdown from "./ActionsDropdown";
import TaskItemById from "./TaskItemById";
import ConfirmDialog from "../../ConfirmDialog";
import TaskItemToggleCheckbox from "./TaskItemToggleCheckbox";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false); // Загрузка только для чекбокса

  const dueDateChip = React.useMemo(() => {
    if (task.completed) return null;
    if (!task.dueDate?.toDate) return null;

    const due = task.dueDate.toDate();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfDayAfterTomorrow = new Date(startOfTomorrow);
    startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1);

    const isOverdue = due < startOfToday;
    const isToday = due >= startOfToday && due < startOfTomorrow;
    const isTomorrow = due >= startOfTomorrow && due < startOfDayAfterTomorrow;

    const label = isOverdue
      ? "Просрочено"
      : isToday
        ? "Сегодня"
        : isTomorrow
          ? "Завтра"
          : due.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

    const className = isOverdue
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : isToday
        ? "bg-primary/10 text-primary border-primary/20"
        : isTomorrow
          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
          : "bg-muted text-muted-foreground border-border";

    return (
      <span
        className={cn(
          "mt-1 w-fit inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
          className,
        )}
      >
        {label}
      </span>
    );
  }, [task.completed, task.dueDate]);

  const toggleTaskStatus = useCallback(async (): Promise<void> => {
    if (isToggling) return;

    const newStatus = !task.completed;
    const myPromise = onToggle(task);

    toast.promise(myPromise, {
      loading: "Обновление статуса...",
      success: newStatus
        ? "Задача выполнена! 🎉"
        : "Задача возвращена в работу",
      error: "Не удалось изменить статус",
    });

    try {
      setIsToggling(true);
      await myPromise;
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, task, onToggle]);

  const handleDelete = useCallback(async () => {
    const myPromise = onDelete(task);

    toast.promise(myPromise, {
      loading: "Удаление...",
      success: `Задача "${task.text}" удалена!`,
      error: `Не удалось удалить задачу!`,
    });

    try {
      setIsDeleting(true);
      await myPromise;
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  }, [task, onDelete]);
  if (isEditing)
    return <TaskItemEdit task={task} setIsEditing={setIsEditing} />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border bg-card p-3 relative border-l-4 cursor-pointer",
        task.priority === 3 && "border-l-red-500",
        task.priority === 2 && "border-l-amber-500",
        task.priority === 1 && "border-l-border",
      )}
    >
      <div className="flex min-w-0 items-start sm:items-center gap-3 overflow-hidden">
        {/* Чекбокс с интегрированным лоадером */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <TaskItemToggleCheckbox
            isToggling={isToggling}
            task={task}
            toggleTaskStatus={toggleTaskStatus}
          />
        </motion.div>

        {/* Текст задачи */}
        <TaskItemById
          task={task}
          trigger={
            <div
              className="flex min-w-0 flex-col cursor-pointer"
              title="Нажмите чтобы открыть задачу"
            >
              <h5
                className={cn(
                  "text-[16px] leading-tight truncate font-medium text-foreground",
                  task.completed && "text-muted-foreground line-through",
                )}
              >
                {task.text}
              </h5>
              {task.description && (
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {task.description}
                </p>
              )}
              {dueDateChip}
            </div>
          }
        />
      </div>

      {/* Кнопки действий */}
      <div
        className={cn(
          "flex items-center justify-end gap-1 transition-opacity",
          // Если меню открыто, оставляем видимым (opacity-100), иначе — по ховеру
          isMenuOpen
            ? "opacity-100"
            : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
        )}
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsEditing((prev) => !prev)}
          className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          title="Редактировать"
        >
          <Edit2 className="w-4 h-4" />
        </motion.button>

        <ConfirmDialog
          title="Удаление задачи"
          isLoading={isDeleting}
          description={`Вы уверены, что хотите удалить "${task.text}"?`}
          actionText="Удалить"
          variant="destructive"
          onConfirm={handleDelete}
          trigger={
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-destructive"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          }
        />

        <ActionsDropdown onOpenChange={setIsMenuOpen} task={task} />
      </div>
    </motion.div>
  );
};

export default React.memo(TaskItem);
