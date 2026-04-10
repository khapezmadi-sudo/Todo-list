import { db } from "@/firebase";
import type { AppUser } from "@/types/user";
import {
  collection,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
  updateDoc,
} from "firebase/firestore";

export const subscribeUsers = (
  onData: (users: AppUser[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe => {
  const usersQuery = query(collection(db, "users"));
  return onSnapshot(
    usersQuery,
    (snap) => {
      const data = snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as object),
      })) as AppUser[];
      onData(data);
    },
    (err) => {
      onError?.(err);
      onData([]);
    },
  );
};

export const setUserBanned = async (uid: string, banned: boolean) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { banned });
};
