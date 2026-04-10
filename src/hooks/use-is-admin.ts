import * as React from "react";

import { auth, db } from "@/firebase";
import useCurrentUser from "@/store/useCurrentUser";
import { doc, onSnapshot } from "firebase/firestore";

export function useIsAdmin() {
  const currentUser = useCurrentUser((state) => state.currentUser);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = doc(db, "admins", currentUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setIsAdmin(snap.exists());
        setIsLoading(false);
      },
      () => {
        setIsAdmin(false);
        setIsLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [currentUser]);

  return {
    isAdmin,
    isLoading,
    uid: auth.currentUser?.uid ?? null,
  };
}
