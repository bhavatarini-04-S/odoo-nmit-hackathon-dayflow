import { LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";
import { NotificationsDropdown } from "./NotificationsDropdown";
export function Topbar() {
  const { currentUser, logout } = useAuth();
  const toggleMobileMenu = useUiStore((state) => state.toggleMobileMenu);
  const navigate = useNavigate();
  const initials = currentUser?.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="relative flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 dark:bg-slate-900 z-40">
      <button
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Open navigation"
        onClick={toggleMobileMenu}
      >
        <Menu className="size-5" />
      </button>
      <label className="hidden max-w-md flex-1 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 md:flex">
        <Search className="size-4" />
        <span className="sr-only">Search Dayflow</span>
        <input
          aria-label="Search Dayflow"
          className="w-full bg-transparent outline-none"
          placeholder="Search people, requests..."
        />
      </label>
      <div className="ml-auto flex items-center gap-3">
        <NotificationsDropdown />
        <div className="hidden flex-col items-end sm:flex">
          <p className="text-sm font-medium leading-tight">{currentUser?.fullName}</p>
          <p className="text-xs text-slate-500 capitalize leading-tight">
            {currentUser?.role}
          </p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          {initials}
        </div>
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Log out"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
