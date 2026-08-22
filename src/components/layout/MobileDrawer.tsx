import { X } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { Sidebar } from "./Sidebar";
export function MobileDrawer() {
  const open = useUiStore((state) => state.mobileMenuOpen);
  const close = useUiStore((state) => state.closeMobileMenu);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close navigation"
        className="absolute inset-0 bg-slate-950/40"
        onClick={close}
      />
      <div className="relative h-full w-72 shadow-xl">
        <button
          aria-label="Close navigation"
          className="absolute top-3 right-3 z-10 rounded p-1 text-slate-500 hover:bg-slate-100"
          onClick={close}
        >
          <X className="size-5" />
        </button>
        <Sidebar mobile />
      </div>
    </div>
  );
}
