import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/router/routes";
import React, { Suspense } from "react"; // Добавили Suspense
import { Routes, Route, Navigate } from "react-router";
import Layout from "./Layout";
import useCurrentUser from "@/store/useCurrentUser";
import { Loading } from "./Loading";
import { useUserDoc } from "@/hooks/use-user-doc";
import { BannedPage } from "@/pages/BannedPage";
import {
  SettingsDialogRoute,
  ProfileDialogRoute,
  StatisticsDialogRoute,
  CreateTaskDialogRoute,
  SearchDialogRoute,
  TaskDialogRoute,
} from "./DialogRoutes";

export const AppRouter: React.FC = () => {
  const currentUser = useCurrentUser((state) => state.currentUser);
  const { userDoc, isLoading: isUserDocLoading } = useUserDoc(currentUser?.uid);
  const isBanned = Boolean(currentUser && userDoc?.banned);

  if (currentUser && isUserDocLoading) {
    return (
      <div className="flex h-d-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isBanned) {
    return (
      <Routes>
        <Route path="/banned" element={<BannedPage />} />
        <Route path="*" element={<Navigate to="/banned" replace />} />
      </Routes>
    );
  }

  return (
    // Fallback — это то, что увидит пользователь во время загрузки чанка
    <Suspense
      fallback={
        <div className="flex h-d-screen w-full items-center justify-center">
          <Loading />
        </div>
      }
    >
      <Routes>
        {/* PUBLIC */}
        {PUBLIC_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={!currentUser ? route.element : <Navigate to="/" replace />}
          />
        ))}

        {/* PRIVATE через Layout */}
        <Route
          element={
            currentUser ? <Layout /> : <Navigate to="/register" replace />
          }
        >
          {/* Dialog Routes - MUST be before PRIVATE_ROUTES for proper matching */}
          {/* /settings and /:page/settings */}
          <Route path="settings" element={<SettingsDialogRoute />} />
          <Route path="today/settings" element={<SettingsDialogRoute />} />
          <Route path="important/settings" element={<SettingsDialogRoute />} />
          <Route path="completed/settings" element={<SettingsDialogRoute />} />
          <Route path="calendar/settings" element={<SettingsDialogRoute />} />

          {/* /profile and /:page/profile */}
          <Route path="profile" element={<ProfileDialogRoute />} />
          <Route path="today/profile" element={<ProfileDialogRoute />} />
          <Route path="important/profile" element={<ProfileDialogRoute />} />
          <Route path="completed/profile" element={<ProfileDialogRoute />} />
          <Route path="calendar/profile" element={<ProfileDialogRoute />} />

          {/* /stats, /statistics and /:page/stats */}
          <Route path="stats" element={<StatisticsDialogRoute />} />
          <Route path="statistics" element={<StatisticsDialogRoute />} />
          <Route path="today/stats" element={<StatisticsDialogRoute />} />
          <Route path="important/stats" element={<StatisticsDialogRoute />} />
          <Route path="completed/stats" element={<StatisticsDialogRoute />} />
          <Route path="calendar/stats" element={<StatisticsDialogRoute />} />

          {/* /create and /:page/create */}
          <Route path="create" element={<CreateTaskDialogRoute />} />
          <Route path="today/create" element={<CreateTaskDialogRoute />} />
          <Route path="important/create" element={<CreateTaskDialogRoute />} />
          <Route path="completed/create" element={<CreateTaskDialogRoute />} />
          <Route path="calendar/create" element={<CreateTaskDialogRoute />} />

          {/* /search and /:page/search */}
          <Route path="search" element={<SearchDialogRoute />} />
          <Route path="today/search" element={<SearchDialogRoute />} />
          <Route path="important/search" element={<SearchDialogRoute />} />
          <Route path="completed/search" element={<SearchDialogRoute />} />
          <Route path="calendar/search" element={<SearchDialogRoute />} />

          {/* /task/:id - Task detail */}
          <Route path="task/:id" element={<TaskDialogRoute />} />

          {/* Regular page routes - AFTER dialog routes */}
          {PRIVATE_ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route
          path="*"
          element={<Navigate to={currentUser ? "/" : "/register"} replace />}
        />
      </Routes>
    </Suspense>
  );
};
