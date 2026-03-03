import { Loading } from "@/components/shared/Loading";
import TaskItem from "@/components/shared/TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth, db } from "@/firebase";
import { deleteTaskById } from "@/services/taskService";
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
import React, { useCallback, useEffect } from "react";

export interface Task {
  id: string;
  text: string;
  description?: string;
  userId: string;
  createdAt: Timestamp;
  completed: boolean;
  isImportant: boolean;
  priority: number;
}

export const HomePage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[] | null>(null); // 1. Исправлено
  const isLoading = tasks === null;

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
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-2xl px-4">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-bold mb-4 text-left">
          Мои задачи
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
