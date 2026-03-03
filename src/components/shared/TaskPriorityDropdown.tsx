import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Flag } from "lucide-react";

interface TaskPriorityDropdownProps {
  priority: number;
  setPriority: (priority: number) => void;
}
const getPriorityStyles = (value: number) => {
  switch (value) {
    case 3:
      return "text-red-600 border-red-300 hover:border-red-400! hover:text-red-800!";
    case 2:
      return "text-amber-600 border-amber-300 hover:border-amber-400! hover:text-amber-800!";
    case 1:
      return "text-gray-600 border-gray-300 hover:border-gray-400! hover:text-gray-800!";
    default:
      return "";
  }
};

const getPriorityLabel = (value: number) => {
  switch (value) {
    case 3:
      return "Высокий";
    case 2:
      return "Средний";
    case 1:
      return "Низкий";
    default:
      return "";
  }
};
export const TaskPriorityDropdown: React.FC<TaskPriorityDropdownProps> = ({
  priority,
  setPriority,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`h-8 text-xs font-normal border ${getPriorityStyles(priority)}`}
        >
          <Flag className="mr-2 h-3.5 w-3.5" />
          {`Приоритет (${getPriorityLabel(priority)})`}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => setPriority(1)}
          className="text-gray-600 focus:bg-gray-100 hover:text-gray-600!"
        >
          Низкий
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setPriority(2)}
          className="text-amber-600 focus:bg-amber-50 hover:text-amber-600!"
        >
          Средний
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setPriority(3)}
          className="text-red-600 focus:bg-red-50 hover:text-red-600!"
        >
          Высокий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
