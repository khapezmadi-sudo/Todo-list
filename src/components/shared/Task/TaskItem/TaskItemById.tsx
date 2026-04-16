import { cn } from "@/lib/utils";
import type { Task, SubTask } from "@/types/task";
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlignLeft,
  Trash2,
  Edit3,
  Plus,
  X,
  Check,
  Star,
  ListTodo,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface TaskItemByIdProps {
  task: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TaskItemById: React.FC<TaskItemByIdProps> = ({
  task,
  trigger,
  open: controlledOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description || "");
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  // Format dates
  const formattedDate = task.createdAt?.toDate
    ? task.createdAt.toDate().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : t("dateNotSpecified");

  const formattedDueDate = task.dueDate?.toDate
    ? task.dueDate.toDate().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    : null;

  const formattedTime = task.createdAt?.toDate
    ? task.createdAt.toDate().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Task actions
  const toggleComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { completed: !task.completed });
    } catch (error) {
      console.error("Error updating task:", error);
    }
    setIsLoading(false);
  }, [task.id, task.completed]);

  const deleteTask = useCallback(async () => {
    if (!confirm(t("confirmDeleteTask"))) return;
    setIsLoading(true);
    try {
      const taskRef = doc(db, "tasks", task.id);
      await deleteDoc(taskRef);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
    setIsLoading(false);
  }, [task.id, setOpen, t]);

  // Description editing
  const saveDescription = useCallback(async () => {
    setIsLoading(true);
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { description });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating description:", error);
    }
    setIsLoading(false);
  }, [task.id, description, t]);

  // Subtask actions
  const addSubtask = useCallback(async () => {
    if (!newSubtaskText.trim()) return;
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      text: newSubtaskText.trim(),
      completed: false,
    };
    const updatedSubtasks = [...subtasks, newSubtask];
    setSubtasks(updatedSubtasks);
    setNewSubtaskText("");

    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  }, [newSubtaskText, subtasks, task.id]);

  const toggleSubtask = useCallback(
    async (subtaskId: string) => {
      const updatedSubtasks = subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st,
      );
      setSubtasks(updatedSubtasks);

      try {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, { subtasks: updatedSubtasks });
      } catch (error) {
        console.error("Error updating subtask:", error);
      }
    },
    [subtasks, task.id],
  );

  const deleteSubtask = useCallback(
    async (subtaskId: string) => {
      const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
      setSubtasks(updatedSubtasks);

      try {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, { subtasks: updatedSubtasks });
      } catch (error) {
        console.error("Error deleting subtask:", error);
      }
    },
    [subtasks, task.id],
  );

  // Progress
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const progress =
    subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header with color indicator */}
        <div
          className={`h-2 w-full ${
            task.completed
              ? "bg-emerald-500"
              : task.isImportant
                ? "bg-amber-500"
                : "bg-primary"
          }`}
        />

        <div className="p-6">
          <DialogHeader className="space-y-4">
            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {task.completed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  {t("completed")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  <Circle className="size-3.5" />
                  {t("inProgress")}
                </span>
              )}

              {task.isImportant && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <Star className="size-3.5" />
                  {t("important")}
                </span>
              )}

              {task.priority > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    task.priority === 3 && "bg-red-500/10 text-red-600",
                    task.priority === 2 && "bg-amber-500/10 text-amber-600",
                    task.priority === 1 && "bg-muted text-muted-foreground",
                  )}
                >
                  <Star className="size-3" />
                  {task.priority === 3
                    ? t("priorityHigh")
                    : task.priority === 2
                      ? t("priorityMedium")
                      : t("priorityLow")}
                </span>
              )}
            </div>

            {/* Task title */}
            <DialogTitle className="text-xl font-semibold leading-relaxed pr-8">
              {task.text}
            </DialogTitle>
          </DialogHeader>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={task.completed ? "outline" : "default"}
              size="sm"
              onClick={toggleComplete}
              disabled={isLoading}
              className="flex-1"
            >
              {task.completed ? (
                <>
                  <Circle className="size-4 mr-2" />
                  {t("markIncomplete")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  {t("markComplete")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteTask}
              disabled={isLoading}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <ScrollArea className="mt-6 max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Description section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlignLeft className="size-4" />
                    {t("description")}
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-2"
                    >
                      <Edit3 className="size-4 mr-1" />
                      {t("edit")}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveDescription}
                        disabled={isLoading}
                        className="h-8 px-2 text-emerald-600"
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setDescription(task.description || "");
                        }}
                        className="h-8 px-2 text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("addDescription")}
                    className="w-full min-h-25 p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="text-sm text-foreground/80 leading-relaxed bg-muted/50 rounded-lg p-3 min-h-15">
                    {task.description || (
                      <span className="text-muted-foreground italic">
                        {t("noDescription")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ListTodo className="size-4" />
                    {t("subtasks")}
                    {subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({completedSubtasks}/{subtasks.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {subtasks.length > 0 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Add subtask */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder={t("addSubtask")}
                    className="flex-1 h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSubtask();
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={addSubtask}
                    disabled={!newSubtaskText.trim()}
                    className="h-9 px-3"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* Subtasks list */}
                <div className="space-y-1">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 group p-2 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                        className="w-4 h-4 rounded border border-muted-foreground/30 cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          subtask.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => deleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                      >
                        <X className="size-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                  {subtasks.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      {t("noSubtasks")}
                    </p>
                  )}
                </div>
              </div>

              {/* Info section */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {t("created")}
                  </div>
                  <p className="text-sm font-medium">{formattedDate}</p>
                  {formattedTime && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {formattedTime}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {t("dueDate")}
                  </div>
                  <p className="text-sm font-medium">
                    {formattedDueDate || (
                      <span className="text-muted-foreground italic">
                        {t("notSet")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Task ID */}
              <p className="text-xs text-muted-foreground font-mono text-center">
                ID: {task.id.slice(0, 8)}...
              </p>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TaskItemById);
