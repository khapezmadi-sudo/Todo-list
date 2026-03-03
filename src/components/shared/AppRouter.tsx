import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/router/routes";
import React, { Suspense } from "react"; // Добавили Suspense
import { Routes, Route, Navigate } from "react-router";
import Layout from "./Layout";
import useCurrentUser from "@/store/useCurrentUser";
import { Loading } from "./Loading";

export const AppRouter: React.FC = () => {
  const currentUser = useCurrentUser((state) => state.currentUser);

  return (
    // Fallback — это то, что увидит пользователь во время загрузки чанка
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
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
