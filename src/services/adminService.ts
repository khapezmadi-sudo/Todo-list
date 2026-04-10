import { db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

type AdminDoc = {
  createdAt?: unknown;
  createdBy?: string;
};

export const subscribeAdmins = (
  onData: (adminUids: string[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe => {
  const adminsQuery = query(collection(db, "admins"));
  return onSnapshot(
    adminsQuery,
    (snap) => {
      const ids = snap.docs.map((d) => d.id);
      onData(ids);
    },
    (err) => {
      onError?.(err);
      onData([]);
    },
  );
};

export const addAdminByUid = async (uid: string, createdByUid: string) => {
  const ref = doc(db, "admins", uid);
  const payload: AdminDoc = { createdAt: serverTimestamp(), createdBy: createdByUid };
  await setDoc(ref, payload, { merge: true });
};

export const removeAdminByUid = async (uid: string) => {
  const ref = doc(db, "admins", uid);
  await deleteDoc(ref);
};
