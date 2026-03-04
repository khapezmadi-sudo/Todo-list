import { lazy, type ReactNode } from "react";

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

type RouteType = {
  path: string;
  element: ReactNode;
};

export const PRIVATE_ROUTES: RouteType[] = [
  { path: "/", element: <HomePage /> },
  { path: "/completed", element: <CompletedPage /> },
  { path: "/important", element: <ImportantPage /> },
  { path: "/today", element: <TodayPage /> },
];

export const PUBLIC_ROUTES: RouteType[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];
