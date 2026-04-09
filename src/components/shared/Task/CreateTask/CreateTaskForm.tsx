import React from "react";
import type {
  Control,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { TaskSchemaData } from "./CreateTaskDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ChevronDown, Inbox, Loader2 } from "lucide-react";
import { TaskPriorityDropdown } from "./TaskPriorityDropdown";
import { DialogClose } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { useWatch } from "react-hook-form";

interface CreateTaskFormProps {
  // Типизируем через стандартные типы RHF
  register: UseFormRegister<TaskSchemaData>;
  handleSubmit: UseFormHandleSubmit<TaskSchemaData>;
  onSubmit: (data: TaskSchemaData) => Promise<void>;
  isSubmitting: boolean;
  setPriority: React.Dispatch<React.SetStateAction<number>>;
  priority: number;
  setValue: UseFormSetValue<TaskSchemaData>;
  control: Control<TaskSchemaData>;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  handleSubmit,
  register,
  isSubmitting,
  onSubmit,
  setPriority,
  priority,
  setValue,
  control,
}) => {
  const { t } = useTranslation();
  const [isDueDateOpen, setIsDueDateOpen] = React.useState(false);
  const dueDate = useWatch({ control, name: "dueDate" }) ?? null;

  const dueDateLabel = React.useMemo(() => {
    if (!dueDate) return t("dueDate");
    return dueDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  }, [dueDate, t]);

  return (
    // В handleSubmit передаем функцию onSubmit
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="px-6 pt-6 pb-4 space-y-4">
        <Input
          type="text"
          placeholder={t("createTask")}
          {...register("text")}
          className="border-none bg-transparent shadow-none text-xl! font-bold tracking-tight focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
        />

        <Input
          type="text"
          placeholder={t("addDescription")}
          {...register("description")}
          className="border-none bg-transparent shadow-none text-sm! text-muted-foreground focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-normal"
              >
                <Calendar className="mr-2 h-3.5 w-3.5" /> {dueDateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2">
                <CalendarPicker
                  mode="single"
                  selected={dueDate ?? undefined}
                  onSelect={(date) => {
                    setValue("dueDate", date ?? null, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    if (date) setIsDueDateOpen(false);
                  }}
                  initialFocus
                />
                {dueDate && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-normal"
                      onClick={() => {
                        setValue("dueDate", null, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                        setIsDueDateOpen(false);
                      }}
                    >
                      {t("removeDueDate")}
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
              {t("cancel")}
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
              t("createTask")
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
