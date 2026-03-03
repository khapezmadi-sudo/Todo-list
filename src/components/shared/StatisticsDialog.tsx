import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

export const StatisticsDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ChartNoAxesColumnIncreasing />
          Статистика
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
};
