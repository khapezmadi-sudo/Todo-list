import React from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export const SettingsDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SettingsIcon />
          Настройки
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
};
