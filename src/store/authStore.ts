import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
interface AuthState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (currentUser) => set({ currentUser }),
      logout: () => set({ currentUser: null }),
    }),
    { name: "dayflow-auth" },
  ),
);
