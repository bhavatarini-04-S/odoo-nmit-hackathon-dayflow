import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ReceiptText,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUiStore } from "../../store/uiStore";

const employeeItems = [
  { label: "Dashboard", to: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Profile", to: "/employee/profile", icon: Users },
  { label: "Attendance", to: "/employee/attendance", icon: CalendarDays },
  { label: "Leave", to: "/employee/leave", icon: ClipboardList },
  { label: "Payroll", to: "/employee/payroll", icon: ReceiptText },
];
const adminItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", to: "/admin/employees", icon: Users },
  { label: "Attendance", to: "/admin/attendance", icon: CalendarDays },
  { label: "Leave requests", to: "/admin/leave-requests", icon: ClipboardList },
  { label: "Payroll", to: "/admin/payroll", icon: ReceiptText },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
];
export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const user = useCurrentUser();
  const closeMobileMenu = useUiStore((state) => state.closeMobileMenu);
  const items = user?.role === "employee" ? employeeItems : adminItems;
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white p-4 dark:bg-slate-900">
      <NavLink
        onClick={closeMobileMenu}
        to={
          user?.role === "employee" ? "/employee/dashboard" : "/admin/dashboard"
        }
        className="mb-8 flex items-center gap-2 px-2 text-xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
          D
        </span>{" "}
        Dayflow
      </NavLink>
      <nav aria-label="Main navigation" className="space-y-1">
        {items.map(({ icon: Icon, label, to }) => (
          <NavLink
            end={to.endsWith("dashboard")}
            key={to}
            onClick={mobile ? closeMobileMenu : undefined}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto px-2 text-xs text-slate-400">
        Every workday, perfectly aligned.
      </p>
    </aside>
  );
}
