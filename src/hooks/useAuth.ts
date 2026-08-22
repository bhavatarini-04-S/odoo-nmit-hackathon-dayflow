import { useAuthStore } from "../store/authStore";
export function useAuth() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    setCurrentUser,
    logout,
  };
}
