import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import type { Task } from "@/types/task";
import { HomePage } from "@/pages/HomePage";
import { CompletedPage } from "@/pages/CompletedPage";
import { ImportantPage } from "@/pages/ImportantPage";
import { TodayPage } from "@/pages/TodayPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { SettingsDialog } from "./SidebarHeaderLayout/SettingsDialog";
import { ProfileDialog } from "./SidebarHeaderLayout/ProfileDialog";
import { StatisticsDialog } from "./SidebarHeaderLayout/StatisticsDialog";
import { CreateTaskDialog } from "./Task/CreateTask/CreateTaskDialog";
import { SearchDialog } from "./SearchDialog";
import TaskItemById from "./Task/TaskItem/TaskItemById";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loading } from "./Loading";
import { useTranslation } from "react-i18next";

type TabType = "account" | "theme" | "notifications";

// Helper to get background page based on path
const getBackgroundPage = (path: string) => {
  if (path.startsWith("/completed")) return <CompletedPage />;
  if (path.startsWith("/important")) return <ImportantPage />;
  if (path.startsWith("/today")) return <TodayPage />;
  if (path.startsWith("/calendar")) return <CalendarPage />;
  return <HomePage />;
};

// Base path without dialog suffix
const getBasePath = (path: string) => {
  return (
    path
      .replace(/\/(settings|profile|stats|statistics|create|search)$/, "")
      .replace(/\/$/, "") || "/"
  );
};

// /settings or /:page/settings
export const SettingsDialogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getBasePath(location.pathname);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  // Render background page with dialog on top
  return (
    <>
      {getBackgroundPage(location.pathname)}
      <SettingsDialog
        open={true}
        onOpenChange={handleOpenChange}
        defaultTab={
          (new URLSearchParams(location.search).get("tab") as TabType) ||
          undefined
        }
      />
    </>
  );
};

// /profile or /:page/profile
export const ProfileDialogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getBasePath(location.pathname);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  return (
    <>
      {getBackgroundPage(location.pathname)}
      <ProfileDialog open={true} onOpenChange={handleOpenChange} />
    </>
  );
};

// /stats, /statistics or /:page/stats, /:page/statistics
export const StatisticsDialogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getBasePath(location.pathname);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  return (
    <>
      {getBackgroundPage(location.pathname)}
      <StatisticsDialog open={true} onOpenChange={handleOpenChange} />
    </>
  );
};

// /create or /:page/create
export const CreateTaskDialogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getBasePath(location.pathname);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  return (
    <>
      {getBackgroundPage(location.pathname)}
      <CreateTaskDialog open={true} onOpenChange={handleOpenChange} />
    </>
  );
};

// /search or /:page/search
export const SearchDialogRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getBasePath(location.pathname);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  return (
    <>
      {getBackgroundPage(location.pathname)}
      <SearchDialog open={true} onOpenChange={handleOpenChange} />
    </>
  );
};

// /task/:id - Task detail dialog with URL
export const TaskDialogRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Get base path for return navigation
  const basePath = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get("from");
    if (from) return from;
    return "/";
  }, [location.search]);

  useEffect(() => {
    if (!id) return;

    const taskRef = doc(db, "tasks", id);
    const unsubscribe = onSnapshot(
      taskRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() } as Task);
        } else {
          setTask(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching task:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(basePath, { replace: true });
    }
  };

  if (loading) {
    return (
      <>
        {getBackgroundPage(basePath)}
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-lg">
            <div className="flex items-center justify-center p-8">
              <Loading />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!task) {
    return (
      <>
        {getBackgroundPage(basePath)}
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-lg">
            <div className="text-center p-6">
              <p className="text-muted-foreground">{t("taskNotFound")}</p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {getBackgroundPage(basePath)}
      <TaskItemById task={task} open={true} onOpenChange={handleOpenChange} />
    </>
  );
};
