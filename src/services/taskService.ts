import type { CreateTask } from "@/components/shared/Task/CreateTask/CreateTaskDialog";
import { db } from "@/firebase";
import type { Task } from "@/types/task";
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export const deleteTaskById = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};

export const toggleTaskCompleted = async (
  task: Pick<Task, "id" | "completed">,
) => {
  const taskRef = doc(db, "tasks", task.id);
  await updateDoc(taskRef, { completed: !task.completed });
};

export const subscribeAllTasks = (
  onData: (tasks: Task[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe => {
  const tasksQuery = query(
    collection(db, "tasks"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    tasksQuery,
    (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];
      onData(data);
    },
    (err) => {
      onError?.(err);
      onData([]);
    },
  );
};

// Универсальная функция обновления задачи
export const updateTask = async (
  taskId: string,
  data: Partial<Task>,
): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);

  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp(), // Полезно хранить дату изменения
  });
};

export const createTask = async (data: CreateTask): Promise<void> => {
  await addDoc(collection(db, "tasks"), data);
};
