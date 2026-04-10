import { lazy, type ReactNode } from "react";
import { AdminRoute } from "@/components/shared/AdminRoute";

// Динамические импорты
const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const CompletedPage = lazy(() =>
  import("@/pages/CompletedPage").then((module) => ({
    default: module.CompletedPage,
  })),
);
const ImportantPage = lazy(() =>
  import("@/pages/ImportantPage").then((module) => ({
    default: module.ImportantPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);
const TodayPage = lazy(() =>
  import("@/pages/TodayPage").then((module) => ({
    default: module.TodayPage,
  })),
);

const CalendarPage = lazy(() =>
  import("@/pages/CalendarPage").then((module) => ({
    default: module.CalendarPage,
  })),
);

const AdminPage = lazy(() =>
  import("@/pages/AdminPage").then((module) => ({
    default: module.AdminPage,
  })),
);

type RouteType = {
  path: string;
  element: ReactNode;
};

export const PRIVATE_ROUTES: RouteType[] = [
  { path: "/", element: <HomePage /> },
  { path: "/completed", element: <CompletedPage /> },
  { path: "/important", element: <ImportantPage /> },
  { path: "/today", element: <TodayPage /> },
  { path: "/calendar", element: <CalendarPage /> },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
  },
];

export const PUBLIC_ROUTES: RouteType[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];
