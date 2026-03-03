import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { Task } from "@/pages/HomePage";
import { toast } from "sonner";
interface ActionsDropdownProps {
  onOpenChange?: (open: boolean) => void; // Добавляем проп
  task: Task;
}
const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  onOpenChange,
  task,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val); // Уведомляем родителя
  };

  const handleToggleStatus = async () => {
    const taskRef = doc(db, "tasks", task.id);
    const newStatus = !task.isImportant;
    const myPromise = updateDoc(taskRef, {
      isImportant: newStatus,
    });

    toast.promise(myPromise, {
      loading: "Обновление статуса...",
      success: newStatus
        ? "Задача помечено как важное"
        : "Задача убрано из важных",
      error: "Не удалось обновить статус",
    });
    try {
      await myPromise;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка обновления:", error.message);
      }
    }
  };
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "p-1.5 rounded-md text-gray-500 transition",
            "hover:bg-gray-200",
            open && "bg-gray-200 text-gray-900", // Выделяем кнопку, когда меню открыто
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={handleToggleStatus}
        >
          <Bookmark className="w-4 h-4" />
          <span>Важный</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default React.memo(ActionsDropdown);