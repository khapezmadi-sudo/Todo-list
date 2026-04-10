import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { SquarePlus } from "lucide-react";
import { SidebarMenuButton } from "../../../ui/sidebar";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/firebase";
import { useState } from "react";
import { toast } from "sonner";
import { CreateTaskForm } from "./CreateTaskForm";
import { createTask } from "@/services/taskService";
import { FieldValue, serverTimestamp, Timestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export type CreateTask = {
  text: string;
  description: string;
  completed: boolean;
  userId: string;
  isImportant: boolean;
  createdAt: FieldValue;
  dueDate?: Timestamp | null;
  reminderAt?: Timestamp | null;
  priority: number;
};

export const taskSchema = z.object({
  text: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  reminderAt: z.date().nullable().optional(),
});

export type TaskSchemaData = z.infer<typeof taskSchema>;

export function CreateTaskDialog() {
  const [priority, setPriority] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<TaskSchemaData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      text: "",
      description: "",
      dueDate: null,
      reminderAt: null,
    },
  });

  const addTask = async (data: TaskSchemaData) => {
    if (!auth.currentUser) return;
    if (priority === 0) setPriority(1);

    const newTaskData: CreateTask = {
      text: data.text,
      description: data.description || "",
      completed: false,
      userId: auth.currentUser.uid,
      isImportant: false,
      createdAt: serverTimestamp(),
      dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
      reminderAt: data.reminderAt ? Timestamp.fromDate(data.reminderAt) : null,
      priority: priority,
    };
    const myPromise = createTask(newTaskData);

    toast.promise(myPromise, {
      loading: "Создание...",
      success: "Задача создана!",
      error: "Ошибка при создании!",
    });

    try {
      await myPromise;
      reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton className="cursor-pointer text-sidebar-primary dark:text-sidebar-primary hover:text-sidebar-primary dark:hover:text-sidebar-primary">
          <SquarePlus className="font-semibold text-sidebar-primary dark:text-sidebar-primary" />
          <span className="text-sidebar-primary dark:text-sidebar-primary font-semibold">
            {t("createTask")}
          </span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl shadow-xl max-h-[90svh] overflow-y-auto">
        <CreateTaskForm
          register={register}
          handleSubmit={handleSubmit} // Передаем функцию обертку
          onSubmit={addTask} // Передаем саму логику
          isSubmitting={isSubmitting}
          setPriority={setPriority}
          priority={priority}
          setValue={setValue}
          control={control}
        />
      </DialogContent>
    </Dialog>
  );
}
