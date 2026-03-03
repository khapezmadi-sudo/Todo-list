import React from "react";
import { SidebarHeader, SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { UserDropdown } from "./UserDropdown";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { LogOutIcon } from "lucide-react";
import { ProfileDialog } from "./ProfileDialog";
import { SettingsDialog } from "./SettingsDialog";
import { StatisticsDialog } from "./StatisticsDialog";

export const SidebarHeaderLayout: React.FC = () => {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <UserDropdown />
            <DropdownMenuContent className="w-40">
              <ProfileDialog />
              <SettingsDialog />
              <StatisticsDialog />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOutIcon className="text-red-600" />
                Выход
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
