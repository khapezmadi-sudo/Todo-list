import { Loading } from "@/components/shared/Loading";
import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useTranslation } from "react-i18next";

import type { Task } from "@/types/task";

export const HomePage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[] | null>(null); // 1. Исправлено
  const isLoading = tasks === null;
  const { t } = useTranslation();

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

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
      if (unsubscribeSnapshot) unsubscribeSnapshot(); // 2. Чистим всё!
    };
  }, []);

  // 3. Оборачиваем в useCallback для работы React.memo в TaskItem
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
      <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-3xl px-3 sm:px-4">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-semibold mb-4 text-left hidden md:block">
          {t("myTasks")}
        </h1>

        {tasks.length === 0 ? (
          <div className="rounded-lg border bg-card p-5 sm:p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Нет задач. Создайте новую задачу!
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            {tasks.map((task) => (
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
