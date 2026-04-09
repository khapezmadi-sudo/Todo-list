import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { Loading } from "@/components/shared/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { auth, db } from "@/firebase";
import { deleteTaskById } from "@/services/taskService";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect } from "react";
import type { Task } from "@/types/task";
import { useTranslation } from "react-i18next";

export const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
  );

  const isLoading = tasks === null;

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTasks(tasksData);
        });
      } else {
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot?.();
    };
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    try {
      await deleteTaskById(task.id);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  }, []);

  const handleToggleStatus = useCallback(async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);
    try {
      await updateDoc(taskRef, { completed: !task.completed });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  }, []);

  const tasksForSelectedDay = React.useMemo(() => {
    if (!tasks) return [];
    if (!selectedDate) return [];

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return tasks
      .filter((t) => t.dueDate?.toDate)
      .filter((t) => {
        const due = t.dueDate!.toDate();
        return due >= start && due < end;
      });
  }, [tasks, selectedDate]);

  const dueDates = React.useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((t) => t.dueDate?.toDate)
      .map((t) => {
        const d = t.dueDate!.toDate();
        d.setHours(0, 0, 0, 0);
        return d;
      });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Дата не выбрана";

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-5xl px-4">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-bold mb-4 text-left">
          {t("calendar")}
        </h1>

        <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-[440px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ hasTasks: dueDates }}
              className="w-full [--cell-size:--spacing(10)]"
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full",
                day_button:
                  "relative data-[has-tasks=true]:after:content-[''] data-[has-tasks=true]:after:absolute data-[has-tasks=true]:after:bottom-1 data-[has-tasks=true]:after:left-1/2 data-[has-tasks=true]:after:-translate-x-1/2 data-[has-tasks=true]:after:h-1 data-[has-tasks=true]:after:w-1 data-[has-tasks=true]:after:rounded-full data-[has-tasks=true]:after:bg-primary",
              }}
            />
          </div>

          <div className="min-w-0 rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-foreground capitalize">
                {selectedDateLabel}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("tasksCount", { count: tasksForSelectedDay.length })}
              </p>
            </div>

            {tasksForSelectedDay.length === 0 ? (
              <p className="text-muted-foreground">
                {t("noTasksForSelectedDate")}
              </p>
            ) : (
              <div className="space-y-2">
                {tasksForSelectedDay.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleStatus}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
