import type { CreateTask } from "@/components/shared/Task/CreateTask/CreateTaskDialog";
import { db } from "@/firebase";
import type { Task } from "@/pages/HomePage";
import {
  doc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";

export const deleteTaskById = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
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
