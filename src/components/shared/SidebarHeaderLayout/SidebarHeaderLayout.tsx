import React from "react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "../../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { UserDropdown } from "./UserDropdown";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { LogOutIcon, User, Settings, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";

export const SidebarHeaderLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Ошибка при выходе:", error);
    }
  };

  // Get current page path for dialog routes
  const getCurrentPagePath = () => {
    const path = location.pathname;
    if (path.startsWith("/completed")) return "/completed";
    if (path.startsWith("/important")) return "/important";
    if (path.startsWith("/today")) return "/today";
    if (path.startsWith("/calendar")) return "/calendar";
    return "";
  };

  const basePath = getCurrentPagePath();

  const navigateAndClose = (to: string) => {
    navigate(to);
    if (isMobile) setOpenMobile(false);
  };

  const openProfile = () => navigateAndClose(`${basePath}/profile`);
  const openSettings = () => navigateAndClose(`${basePath}/settings`);
  const openStatistics = () => navigateAndClose(`${basePath}/stats`);

  return (
    <SidebarHeader className="bg-primary/95 border-b border-primary/20 p-0 px-3 py-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <UserDropdown />
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={openProfile}>
                <User className="w-4 h-4 mr-2" />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openSettings}>
                <Settings className="w-4 h-4 mr-2" />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openStatistics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                {t("statistics")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOutIcon className="text-destructive" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
