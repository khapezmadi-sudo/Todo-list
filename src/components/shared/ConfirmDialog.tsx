import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

// Типизируем пропсы
interface ConfirmDialogProps {
  trigger: React.ReactNode; // Кнопка или элемент, который открывает диалог
  title: string; // Заголовок (напр. "Удалить задачу?")
  description: string; // Описание последствий
  actionText?: string; // Текст на главной кнопке (по дефолту "Подтвердить")
  onConfirm: () => Promise<void> | void; // Функция, которая сработает при нажатии
  variant?: "default" | "destructive"; // Стиль кнопки (синий/черный или красный)
  isLoading?: boolean; // Состояние загрузки (для Firebase запросов)
}

function ConfirmDialog({
  trigger,
  title,
  description,
  actionText = "Подтвердить",
  onConfirm,
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false); // Закрываем после выполнения
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-100 p-6 top-45">
        <DialogHeader className="flex flex-col items-center gap-3 text-center sm:text-left sm:items-start">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              variant === "destructive"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Отмена
            </Button>
          </DialogClose>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(ConfirmDialog);