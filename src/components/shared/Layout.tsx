import { Outlet, useLocation } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const location = useLocation();
  const { t } = useTranslation();

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
        <main className="flex-1 w-full min-w-0">
          <div className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background/90 px-3 py-3 backdrop-blur md:hidden">
            <SidebarTrigger className="shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {pageTitle}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                Todo List
              </div>
            </div>
          </div>

          <div className="w-full px-3 py-3 sm:px-6 sm:py-6">
            <SidebarTrigger className="hidden md:inline-flex" />
            <div className="mt-3 md:mt-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
