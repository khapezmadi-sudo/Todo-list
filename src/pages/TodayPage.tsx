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
  updateDoc,
  where,
} from "firebase/firestore";
import { Loading } from "@/components/shared/Loading";
import { deleteTaskById } from "@/services/taskService";
import type { Task } from "./HomePage";
import { useTranslation } from "react-i18next";

export const TodayPage = () => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const isLoading = tasks === null;
  const { t } = useTranslation();

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Устанавливаем 00:00:00.000

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("createdAt", ">=", startOfToday), // Фильтруем задачи, созданные сегодня
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

        {tasks.length === 0 ? (
          <p className="text-gray-500">Нет задач. Создайте новую задачу!</p>
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
