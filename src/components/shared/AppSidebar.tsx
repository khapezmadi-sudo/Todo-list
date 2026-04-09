import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarHeaderLayout } from "./SidebarHeaderLayout/SidebarHeaderLayout";
import {
  Bookmark,
  CalendarDays,
  ClipboardList,
  Clock,
  ListChecks,
} from "lucide-react";
import { CreateTaskDialog } from "./Task/CreateTask/CreateTaskDialog";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";
import { ToggleLanguageSelect } from "./ToggleLanguageSelect";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderLayout />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SearchDialog />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CreateTaskDialog />
            </SidebarMenuItem>

            <SidebarMenuItem onClick={() => navigate("/today")}>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer transition",
                  location.pathname === "/today"
                    ? "bg-(--button-color)! text-white! hover:bg-(--button-color)! hover:text-white!"
                    : "text-muted-foreground",
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{t("today")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem onClick={() => navigate("/calendar")}>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer transition",
                  location.pathname === "/calendar"
                    ? "bg-(--button-color)! text-white! hover:bg-(--button-color)! hover:text-white!"
                    : "text-muted-foreground",
                )}
              >
                <CalendarDays className="h-4 w-4" />
                <span>{t("calendar")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem onClick={() => navigate("/")}>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer transition",
                  location.pathname === "/"
                    ? "bg-(--button-color)! text-white! hover:bg-(--button-color)! hover:text-white!"
                    : "text-muted-foreground",
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span>{t("allTasks")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem onClick={() => navigate("/completed")}>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer transition",
                  location.pathname === "/completed"
                    ? "bg-(--button-color)! text-white! hover:bg-(--button-color)!"
                    : "text-muted-foreground",
                )}
              >
                <ListChecks className="h-4 w-4" />
                <span>{t("completed")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem onClick={() => navigate("/important")}>
              <SidebarMenuButton
                className={cn(
                  "cursor-pointer transition items-center",
                  location.pathname === "/important"
                    ? "bg-(--button-color)! text-white! hover:bg-(--button-color)!"
                    : "text-muted-foreground",
                )}
              >
                <Bookmark className="h-4 w-4" />
                <span>{t("important")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenuItem>
              <ToggleLanguageSelect />
            </SidebarMenuItem>
          </SidebarGroup>
        </SidebarContent>
      </SidebarFooter>
    </Sidebar>
  );
}
