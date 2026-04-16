import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { Edit2, Trash2, Flag } from "lucide-react";
import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router";
import TaskItemEdit from "./TaskItemEdit";
import { toast } from "sonner";
import ActionsDropdown from "./ActionsDropdown";
import ConfirmDialog from "../../ConfirmDialog";
import TaskItemToggleCheckbox from "./TaskItemToggleCheckbox";
import { useTranslation } from "react-i18next";

// Priority config
const priorityConfig: Record<
  number,
  { color: string; label: string; bg: string }
> = {
  0: { color: "", label: "", bg: "" },
  1: { color: "text-muted-foreground", label: "Low", bg: "bg-muted/50" },
  2: { color: "text-amber-600", label: "Medium", bg: "bg-amber-500/10" },
  3: { color: "text-destructive", label: "High", bg: "bg-red-500/10" },
};

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false); // Загрузка только для чекбокса

  const handleTaskClick = useCallback(() => {
    const currentPath = location.pathname;
    navigate(`/task/${task.id}?from=${encodeURIComponent(currentPath)}`);
  }, [navigate, location.pathname, task.id]);

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
          "mt-1 w-fit inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[10px] font-semibold",
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
      loading: t("toastUpdatingStatus"),
      success: newStatus ? t("toastTaskCompleted") : t("toastTaskReopened"),
      error: t("toastUpdateFailed"),
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
      loading: t("toastDeleting"),
      success: t("toastTaskDeleted", { text: task.text }),
      error: t("toastDeleteFailed"),
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

        {/* Текст задачи - улучшенная мобильная адаптация */}
        <div
          onClick={handleTaskClick}
          className="flex min-w-0 flex-col cursor-pointer py-1"
          title={t("createTask")}
        >
          {/* Заголовок с приоритетом */}
          <div className="flex items-center gap-2">
            <h5
              className={cn(
                "text-base sm:text-[16px] leading-snug sm:leading-tight line-clamp-2 sm:truncate font-medium text-foreground",
                task.completed && "text-muted-foreground line-through",
                task.priority === 3 && !task.completed && "font-semibold",
              )}
            >
              {task.text}
            </h5>
            {/* Приоритет chip */}
            {task.priority > 0 && (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  priorityConfig[task.priority as keyof typeof priorityConfig]
                    .bg,
                  priorityConfig[task.priority as keyof typeof priorityConfig]
                    .color,
                )}
              >
                <Flag className="w-3 h-3" />
              </span>
            )}
          </div>
          {task.description && (
            <p className="mt-0.5 line-clamp-1 sm:truncate text-xs sm:text-[12px] text-muted-foreground">
              {task.description}
            </p>
          )}
          {/* Chips row */}
          <div className="flex items-center gap-2 flex-wrap">
            {dueDateChip}
            {task.isImportant && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                ⭐ {t("important")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      {/* Кнопки действий - улучшенная мобильная адаптация */}
      <div
        className={cn(
          "flex items-center justify-end gap-1 sm:gap-2 transition-opacity",
          // На мобильном всегда видимы для удобства, на десктопе по ховеру
          isMenuOpen
            ? "opacity-100"
            : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
        )}
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing((prev) => !prev)}
          className="rounded-md p-2.5 sm:p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          title={t("update")}
        >
          <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
        </motion.button>

        <ConfirmDialog
          title={t("delete")}
          isLoading={isDeleting}
          description={`${t("settingsDeleteAccountDescription")} "${task.text}"?`}
          actionText={t("delete")}
          variant="destructive"
          onConfirm={handleDelete}
          trigger={
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-md p-2.5 sm:p-2 text-muted-foreground transition hover:bg-accent hover:text-destructive min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              title={t("delete")}
            >
              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>
          }
        />

        <ActionsDropdown onOpenChange={setIsMenuOpen} task={task} />
      </div>
    </motion.div>
  );
};

export default React.memo(TaskItem);
