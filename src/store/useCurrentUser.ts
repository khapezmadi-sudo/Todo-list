import type { User } from "firebase/auth";
import { create } from "zustand";

interface CurrentUserState {
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
}

const useCurrentUser = create<CurrentUserState>()((set) => ({
  currentUser: null,
  isLoading: true,
  setCurrentUser: (user) => set({ currentUser: user, isLoading: false }),
}));

export default useCurrentUser;
