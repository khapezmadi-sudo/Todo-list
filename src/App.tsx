import { useEffect } from "react";
import "./App.css";
import { AppRouter } from "./components/shared/AppRouter";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { Loading } from "./components/shared/Loading";
import useCurrentUser from "./store/useCurrentUser";
import { Toaster } from "./components/ui/sonner";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

function App() {
  const setCurrentUser = useCurrentUser((state) => state.setCurrentUser);
  const isLoading = useCurrentUser((state) => state.isLoading);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        setDoc(
          ref,
          {
            uid: user.uid,
            email: user.email ?? null,
            displayName: user.displayName ?? null,
            photoURL: user.photoURL ?? null,
            banned: false,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true },
        ).catch(() => {
          // ignore
        });
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
