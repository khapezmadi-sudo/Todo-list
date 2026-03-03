import { cn } from "@/lib/utils";
import type { Task } from "@/pages/HomePage";
import { Check, Loader2 } from "lucide-react";
import React from "react";

interface TaskItemToggleCheckboxProps {
  className?: string;
  toggleTaskStatus: () => Promise<void>;
  task: Task;
  isToggling: boolean;
}

const TaskItemToggleCheckbox: React.FC<TaskItemToggleCheckboxProps> = ({
  className,
  toggleTaskStatus,
  task,
  isToggling,
}) => {
  return (
    <div
      onClick={toggleTaskStatus}
      className={cn(
        "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition relative",
        task.completed
          ? "border-green-500 bg-green-50"
          : "hover:border-green-500 border-gray-300",
        isToggling && "opacity-70 pointer-events-none",
        className,
      )}
    >
      {isToggling ? (
        <Loader2 className="w-3.5 h-3.5 text-green-500 animate-spin" />
      ) : (
        <Check
          className={cn(
            "w-4 h-4 text-green-500 transition",
            task.completed ? "opacity-100" : "opacity-0 group-hover:opacity-30",
          )}
        />
      )}
    </div>
  );
};


export default React.memo(TaskItemToggleCheckbox);