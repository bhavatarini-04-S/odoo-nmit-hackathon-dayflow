import type { AttendanceStatus, LeaveStatus } from "../../types";

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus;
}

const statusStyles: Record<
  AttendanceStatus | LeaveStatus,
  { bg: string; text: string }
> = {
  Present: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Absent: { bg: "bg-red-100", text: "text-red-700" },
  "Half-Day": { bg: "bg-amber-100", text: "text-amber-700" },
  Leave: { bg: "bg-slate-100", text: "text-slate-700" },
  Pending: { bg: "bg-amber-100", text: "text-amber-700" },
  Approved: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Rejected: { bg: "bg-red-100", text: "text-red-700" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.Pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text} dark:bg-opacity-20`}
    >
      {status}
    </span>
  );
}
