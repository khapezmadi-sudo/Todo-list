import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  SquarePlus,
} from "lucide-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useState } from "react";
import { toast } from "sonner";
import { CreateTaskForm } from "./CreateTaskForm";

export const taskSchema = z.object({
  text: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(),
});

export type TaskSchemaData = z.infer<typeof taskSchema>;

export function CreateTaskDialog() {
  const [prority, setPriority] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TaskSchemaData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { text: "", description: "" },
  });

  const addTask = async (data: TaskSchemaData) => {
    if (!auth.currentUser) return;
    if(prority === 0) setPriority(1);

    const myPromise = addDoc(collection(db, "tasks"), {
      text: data.text,
      description: data.description || "",
      completed: false,
      userId: auth.currentUser.uid,
      isImportant: false,
      createdAt: new Date(),
      priority: prority
    });

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
        <SidebarMenuButton className="cursor-pointer">
          <SquarePlus className="font-semibold text-(--button-color)" />
          <span className="text-(--button-color) font-semibold">
            Добавить задачу
          </span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl shadow-xl top-24 translate-y-0">
        <CreateTaskForm
          register={register}
          handleSubmit={handleSubmit} // Передаем функцию обертку
          onSubmit={addTask} // Передаем саму логику
          isSubmitting={isSubmitting}
          setPriority={setPriority}
          priority={prority}
        />
      </DialogContent>
    </Dialog>
  );
}
