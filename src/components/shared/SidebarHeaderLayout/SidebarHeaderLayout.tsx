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
import {
  LaptopMinimal,
  LogOutIcon,
  Moon,
  Sun,
  Waves,
  Flower2,
  Coffee,
  Sparkles,
  Sunset,
  Snowflake,
  Terminal,
  Zap,
  Trees,
  Braces,
} from "lucide-react";
import { ProfileDialog } from "./ProfileDialog";
import { SettingsDialog } from "./SettingsDialog";
import { StatisticsDialog } from "./StatisticsDialog";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

export const SidebarHeaderLayout: React.FC = () => {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === "ocean") return Waves;
    if (theme === "sakura") return Flower2;
    if (theme === "coffee") return Coffee;
    if (theme === "lavender") return Sparkles;
    if (theme === "sunset") return Sunset;
    if (theme === "nord") return Snowflake;
    if (theme === "retro") return Terminal;
    if (theme === "cyberpunk") return Zap;
    if (theme === "forest") return Trees;
    if (theme === "monokai") return Braces;
    if (resolvedTheme === "dark") return Moon;
    return Sun;
  };
  const ThemeIcon = getThemeIcon();

  const getThemeLabel = () => {
    if (theme === "ocean") return "Ocean";
    if (theme === "sakura") return "Sakura";
    if (theme === "coffee") return "Coffee";
    if (theme === "lavender") return "Lavender";
    if (theme === "sunset") return "Sunset";
    if (theme === "nord") return "Nord";
    if (theme === "retro") return "Retro";
    if (theme === "cyberpunk") return "Cyberpunk";
    if (theme === "forest") return "Forest";
    if (theme === "monokai") return "Monokai";
    if (theme === "system") return t("themeSystem");
    if (theme === "dark") return t("themeDark");
    return t("themeLight");
  };
  const themeLabel = getThemeLabel();
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <SidebarHeader className="bg-primary/95 border-b border-primary/20 p-3">
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
                    <DropdownMenuRadioItem value="ocean">
                      <Waves className="h-4 w-4" />
                      Ocean
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sakura">
                      <Flower2 className="h-4 w-4" />
                      Sakura
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="coffee">
                      <Coffee className="h-4 w-4" />
                      Coffee
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="lavender">
                      <Sparkles className="h-4 w-4" />
                      Lavender
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sunset">
                      <Sunset className="h-4 w-4" />
                      Sunset
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="nord">
                      <Snowflake className="h-4 w-4" />
                      Nord
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="retro">
                      <Terminal className="h-4 w-4" />
                      Retro
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cyberpunk">
                      <Zap className="h-4 w-4" />
                      Cyberpunk
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="forest">
                      <Trees className="h-4 w-4" />
                      Forest
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="monokai">
                      <Braces className="h-4 w-4" />
                      Monokai
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
