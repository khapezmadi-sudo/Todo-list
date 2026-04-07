import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { useCallback, useEffect, useState } from "react";
import type { Task } from "./HomePage";
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
import { deleteTaskById } from "@/services/taskService";
import { Loading } from "@/components/shared/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export const CompletedPage = () => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const isLoading = tasks === null;
  const {t} = useTranslation();
  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("completed", "==", true),
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
  const handleToggleStatus = useCallback(async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);

    try {
      await updateDoc(taskRef, {
        completed: !task.completed,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка обновления:", error.message);
      }
    }
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    try {
      await deleteTaskById(task.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка при удалении:", error.message);
      }
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
    <div className="h-[calc(100vh-120px)]  flex justify-center">
      <ScrollArea className="w-full max-w-2xl px-4   ">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-bold mb-4 text-left">
          {t("completedTasks")}
        </h1>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-left">Нет выполненных задач!</p>
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
