import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white px-5 py-4 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
          <Building2 aria-hidden="true" className="size-5" /> Dayflow
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
    </div>
  );
}
