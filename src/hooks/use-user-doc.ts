import * as React from "react";

import { db } from "@/firebase";
import type { AppUser } from "@/types/user";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserDoc(uid: string | null | undefined) {
  const [userDoc, setUserDoc] = React.useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!uid) {
      setUserDoc(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setUserDoc(snap.exists() ? ({ uid, ...(snap.data() as object) } as AppUser) : null);
        setIsLoading(false);
      },
      () => {
        setUserDoc(null);
        setIsLoading(false);
      },
    );

    return () => {
      unsub();
    };
  }, [uid]);

  return { userDoc, isLoading };
}
