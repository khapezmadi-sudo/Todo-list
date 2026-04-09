import React from "react";
import { SidebarHeader, SidebarMenu, SidebarMenuItem } from "../../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { UserDropdown } from "./UserDropdown";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { LaptopMinimal, LogOutIcon, Moon, Sun } from "lucide-react";
import { ProfileDialog } from "./ProfileDialog";
import { SettingsDialog } from "./SettingsDialog";
import { StatisticsDialog } from "./StatisticsDialog";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

export const SidebarHeaderLayout: React.FC = () => {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themeIcon = resolvedTheme === "dark" ? Moon : Sun;
  const ThemeIcon = themeIcon;

  const themeLabel =
    theme === "system"
      ? t("themeSystem")
      : theme === "dark"
        ? t("themeDark")
        : t("themeLight");
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ThemeIcon className="size-4 shrink-0" />
                  <span className="flex-1">{t("theme")}</span>
                  <span className="text-xs text-muted-foreground">
                    {themeLabel}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={theme ?? "system"}
                    onValueChange={(value) => setTheme(value)}
                  >
                    <DropdownMenuRadioItem value="system">
                      <LaptopMinimal className="h-4 w-4" />
                      {t("themeSystem")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">
                      <Sun className="h-4 w-4" />
                      {t("themeLight")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="h-4 w-4" />
                      {t("themeDark")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
