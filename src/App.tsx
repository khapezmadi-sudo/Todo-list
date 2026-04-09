import { useEffect } from "react";
import "./App.css";
import { AppRouter } from "./components/shared/AppRouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Loading } from "./components/shared/Loading";
import useCurrentUser from "./store/useCurrentUser";
import { Toaster } from "./components/ui/sonner";

function App() {
  const setCurrentUser = useCurrentUser((state) => state.setCurrentUser);
  const isLoading = useCurrentUser((state) => state.isLoading);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--button-color)", // Темный фон (Slate 800)
            color: "#fff", // Белый текст
            border: "1px solid #374151", // Тонкая рамка
          },
        }}
      />
    </div>
  );
}

export default App;
