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
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset>
          {/* Mobile top bar */}
          <div className="md:hidden sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-2 px-3">
              <SidebarTrigger className="" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{pageTitle}</div>
              </div>
            </div>
          </div>
          <main className="flex-1 w-full min-w-0">
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
