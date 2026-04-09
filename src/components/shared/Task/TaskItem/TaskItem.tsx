import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { Edit2, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";
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
      ? "bg-red-50 text-red-700 border-red-200"
      : isToday
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : isTomorrow
          ? "bg-sky-50 text-sky-700 border-sky-200"
          : "bg-slate-50 text-slate-700 border-slate-200";

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
    <div
      className={cn(
        "group p-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3 transition hover:bg-gray-50 relative border-l-4",
        task.priority === 3 && "border-l-red-500",
        task.priority === 2 && "border-l-amber-500",
        task.priority === 1 && "border-l-gray-300",
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Чекбокс с интегрированным лоадером */}
        <TaskItemToggleCheckbox
          isToggling={isToggling}
          task={task}
          toggleTaskStatus={toggleTaskStatus}
        />

        {/* Текст задачи */}
        <TaskItemById
          task={task}
          trigger={
            <div
              className="flex flex-col truncate cursor-pointer"
              title="Нажмите чтобы открыть задачу"
            >
              <h5
                className={cn(
                  "text-[16px] text-[#202020] leading-tight truncate font-medium",
                  task.completed && "text-gray-400 line-through",
                )}
              >
                {task.text}
              </h5>
              {task.description && (
                <p className="text-[12px] text-[#666666] truncate mt-0.5">
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
          "flex items-center gap-1 transition-opacity",
          // Если меню открыто, оставляем видимым (opacity-100), иначе — по ховеру
          isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-blue-600 transition"
          title="Редактировать"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <ConfirmDialog
          title="Удаление задачи"
          isLoading={isDeleting}
          description={`Вы уверены, что хотите удалить "${task.text}"?`}
          actionText="Удалить"
          variant="destructive"
          onConfirm={handleDelete}
          trigger={
            <button
              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-600 transition"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          }
        />

        <ActionsDropdown onOpenChange={setIsMenuOpen} task={task} />
      </div>
    </div>
  );
};

export default React.memo(TaskItem);
