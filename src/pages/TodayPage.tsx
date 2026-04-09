import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Loading } from "@/components/shared/Loading";
import { deleteTaskById } from "@/services/taskService";
import type { Task } from "@/types/task";
import { useTranslation } from "react-i18next";

export const TodayPage = () => {
  const [todayTasks, setTodayTasks] = useState<Task[] | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<Task[] | null>(null);
  const isLoading = todayTasks === null || overdueTasks === null;
  const { t } = useTranslation();

  useEffect(() => {
    let unsubscribeTodaySnapshot: (() => void) | undefined;
    let unsubscribeOverdueSnapshot: (() => void) | undefined;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfTodayTs = Timestamp.fromDate(startOfToday);
    const startOfTomorrowTs = Timestamp.fromDate(startOfTomorrow);

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const todayQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("dueDate", ">=", startOfTodayTs),
          where("dueDate", "<", startOfTomorrowTs),
          orderBy("dueDate", "asc"),
        );

        const overdueQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("completed", "==", false),
          where("dueDate", "<", startOfTodayTs),
          orderBy("dueDate", "asc"),
        );

        unsubscribeTodaySnapshot = onSnapshot(todayQuery, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTodayTasks(tasksData);
        });

        unsubscribeOverdueSnapshot = onSnapshot(
          overdueQuery,
          (querySnapshot) => {
            const tasksData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Task[];
            setOverdueTasks(tasksData);
          },
        );
      } else {
        setTodayTasks([]);
        setOverdueTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTodaySnapshot?.();
      unsubscribeOverdueSnapshot?.();
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

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div className="h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-2xl px-4">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-bold mb-4 text-left">
          {t("todayTasks")}
        </h1>

        {overdueTasks.length > 0 && (
          <div className="pb-6">
            <h2 className="text-sm font-semibold text-red-700 mb-2">
              {t("overdue")}
            </h2>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleStatus}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {todayTasks.length === 0 ? (
          <p className="text-gray-500">{t("noTasksToday")}</p>
        ) : (
          <div className="space-y-2 pb-6">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleStatus}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
