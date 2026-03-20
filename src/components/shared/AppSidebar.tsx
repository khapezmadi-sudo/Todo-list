import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarHeaderLayout } from "./SidebarHeaderLayout";
import {
  Bookmark,
  CalendarDays,
  ClipboardList,
  ListChecks,
} from "lucide-react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";

export function AppSidebar() {
  const location = useLocation();
  console.log(location.pathname);
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
                <CalendarDays className="h-4 w-4" />
                <span>Сегодня</span>
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
                <span>Все задачи</span>
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
                <span>Выполнено</span>
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
                <span>Важные</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
