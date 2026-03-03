import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Bell,
  Calendar,
  ChevronDown,
  Inbox,
  Loader2,
} from "lucide-react";
import { DialogClose } from "../ui/dialog";
import type { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import type { TaskSchemaData } from "./CreateTaskDialog";

import { TaskPriorityDropdown } from "./TaskPriorityDropdown";

interface CreateTaskFormProps {
  // Типизируем через стандартные типы RHF
  register: UseFormRegister<TaskSchemaData>;
  handleSubmit: UseFormHandleSubmit<TaskSchemaData>;
  onSubmit: (data: TaskSchemaData) => Promise<void>;
  isSubmitting: boolean;
  setPriority: React.Dispatch<React.SetStateAction<number>>;
  priority: number;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  handleSubmit,
  register,
  isSubmitting,
  onSubmit, // Переименовал для ясности
  setPriority,
  priority
}) => {
  return (
    // В handleSubmit передаем функцию onSubmit
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="px-6 pt-6 pb-4 space-y-4">
        <Input
          type="text"
          placeholder="Название задачи"
          {...register("text")}
          className="border-none bg-transparent shadow-none text-xl! font-bold tracking-tight focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
        />

        <Input
          type="text"
          placeholder="Добавить описание..."
          {...register("description")}
          className="border-none bg-transparent shadow-none text-sm! text-muted-foreground focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-normal"
          >
            <Calendar className="mr-2 h-3.5 w-3.5" /> Срок
          </Button>
          <TaskPriorityDropdown setPriority={setPriority} priority={priority} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs font-normal"
          >
            <Bell className="mr-2 h-3.5 w-3.5" /> Напоминание
          </Button>
        </div>
      </div>

      <div className="border-t" />

      <div className="flex items-center justify-between px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="px-2 h-8 font-normal text-muted-foreground"
        >
          <Inbox className="mr-2 h-4 w-4" /> Входящие{" "}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>

        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="secondary" type="button" className="h-9 px-4">
              Отмена
            </Button>
          </DialogClose>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-5 font-medium bg-(--button-color) hover:bg-(--button-color)/90 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Добавить задачу"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
