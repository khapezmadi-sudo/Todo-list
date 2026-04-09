import type { Task } from "@/types/task";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlignLeft,
  Hash,
} from "lucide-react";
import useCurrentUser from "@/store/useCurrentUser";

interface TaskItemByIdProps {
  task: Task;
  trigger: React.ReactNode;
}

const TaskItemById: React.FC<TaskItemByIdProps> = ({ task, trigger }) => {
  const currentUser = useCurrentUser((state) => state.currentUser);
  // Форматируем дату из Firebase Timestamp
  const formattedDate = task.createdAt?.toDate
    ? task.createdAt
        .toDate()
        .toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : "Дата не указана";

  const formattedDueDate = task.dueDate?.toDate
    ? task.dueDate
        .toDate()
        .toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : null;

  const formattedTime = task.createdAt?.toDate
    ? task.createdAt.toDate().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const statusLabel = task.completed ? "Выполнено" : "Не выполнено";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 p-0 overflow-hidden rounded-2xl shadow-xl sm:max-w-2xl">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

          <div className="relative p-6">
            <DialogHeader className="gap-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={
                        task.completed
                          ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
                          : "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"
                      }
                    >
                      {task.completed ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Circle className="size-3.5" />
                      )}
                      <span>{statusLabel}</span>
                    </div>

                    {task.isImportant && (
                      <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Важное
                      </div>
                    )}
                  </div>

                  <DialogTitle className="truncate text-2xl font-semibold leading-tight text-foreground">
                    {task.text}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="rounded-xl border bg-card/60 p-4">
                <div className="flex items-start gap-3">
                  <AlignLeft className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                      Описание
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-foreground/90">
                      {task.description ||
                        "Описание к этой задаче еще не добавлено..."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-card/60 p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                        Создано
                      </div>
                      <div className="mt-1 text-sm text-foreground/90">
                        <span>{formattedDate}</span>
                      </div>
                      {formattedTime && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span>{formattedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-card/60 p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">
                        Срок
                      </div>
                      <div className="mt-1 text-sm text-foreground/90">
                        {formattedDueDate ?? "Не задан"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="size-3.5" />
                <span className="font-mono">{task.id.slice(0, 8)}...</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                  {currentUser?.displayName ?? ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TaskItemById);
