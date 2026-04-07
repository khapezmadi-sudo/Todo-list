import React from "react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import { useTranslation } from "react-i18next";

export const SettingsDialog: React.FC = () => {
  const {t} = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SettingsIcon />
          {t("settings")}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
};
