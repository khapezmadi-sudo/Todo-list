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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
        <SidebarMenu>
          <SidebarMenuItem>
            <ToggleLanguageSelect />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
