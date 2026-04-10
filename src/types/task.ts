import type { Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  text: string;
  description?: string;
  userId: string;
  createdAt: Timestamp;
  dueDate?: Timestamp | null;
  reminderAt?: Timestamp | null;
  reminderFiredAt?: Timestamp | null;
  completed: boolean;
  isImportant: boolean;
  priority: number;
}
