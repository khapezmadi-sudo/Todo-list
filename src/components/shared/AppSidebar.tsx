import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarHeaderLayout } from "./SidebarHeaderLayout/SidebarHeaderLayout";
import {
  Bookmark,
  CalendarDays,
  ClipboardList,
  Clock,
  ListChecks,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { CreateTaskDialog } from "./Task/CreateTask/CreateTaskDialog";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";
import { ToggleLanguageSelect } from "./ToggleLanguageSelect";
import { useTranslation } from "react-i18next";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const { isMobile, setOpenMobile } = useSidebar();

  const navigateAndClose = (to: string) => {
    navigate(to);
    if (isMobile) setOpenMobile(false);
  };
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

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <SidebarMenuItem onClick={() => navigateAndClose("/today")}>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <SidebarMenuItem onClick={() => navigateAndClose("/calendar")}>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <SidebarMenuItem onClick={() => navigateAndClose("/")}>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SidebarMenuItem onClick={() => navigateAndClose("/completed")}>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <SidebarMenuItem onClick={() => navigateAndClose("/important")}>
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
            </motion.div>

            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <SidebarMenuItem onClick={() => navigateAndClose("/admin")}>
                  <SidebarMenuButton
                    className={cn(
                      "cursor-pointer transition items-center",
                      location.pathname === "/admin"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>
            )}
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
