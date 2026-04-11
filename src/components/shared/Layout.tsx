import { Outlet, useLocation } from "react-router";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useTranslation } from "react-i18next";
import { useTaskReminders } from "@/hooks/use-task-reminders";
import useCurrentUser from "@/store/useCurrentUser";

export default function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const currentUser = useCurrentUser((state) => state.currentUser);

  useTaskReminders(currentUser?.uid);

  const pageTitle = (() => {
    switch (location.pathname) {
      case "/today":
        return t("today");
      case "/calendar":
        return t("calendar");
      case "/completed":
        return t("completed");
      case "/important":
        return t("important");
      case "/":
      default:
        return t("allTasks");
    }
  })();

  return (
    <SidebarProvider>
      <div className="flex min-h-d-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset>
          {/* Mobile top bar with accent color */}
          <div className="md:hidden sticky top-0 z-40 w-full border-b border-primary/20 bg-primary/95 backdrop-blur supports-backdrop-filter:bg-primary/90 pt-safe">
            <div className="flex h-14 items-center gap-2 px-3">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-primary-foreground">
                  {pageTitle}
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 w-full min-w-0 pb-safe">
            <div className="w-full px-3 py-3 sm:px-6 sm:py-6">
              <SidebarTrigger className="hidden md:inline-flex" />
              <div className="mt-3 md:mt-4">
                <Outlet />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
