import type { ReactNode } from "react";
import { MobileDrawer } from "./MobileDrawer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="hidden md:fixed md:inset-y-0 md:flex">
        <Sidebar />
      </div>
      <div className="md:pl-64">
        <Topbar />
        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
      <MobileDrawer />
    </div>
  );
}
