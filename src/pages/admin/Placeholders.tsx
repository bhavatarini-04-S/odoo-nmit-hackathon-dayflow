import { ComingSoon } from "../../components/common/ComingSoon";
import { AppLayout } from "../../components/layout/AppLayout";
function AdminPage({ title }: { title: string }) {
  return (
    <AppLayout>
      <ComingSoon title={title} />
    </AppLayout>
  );
}
export function AdminDashboard() {
  return <AdminPage title="Admin dashboard" />;
}
export function AdminEmployees() {
  return <AdminPage title="Employees" />;
}
export function AdminAttendance() {
  return <AdminPage title="Attendance management" />;
}
export function AdminLeaveRequests() {
  return <AdminPage title="Leave requests" />;
}
export function AdminPayroll() {
  return <AdminPage title="Payroll management" />;
}
export function AdminAnalytics() {
  return <AdminPage title="Workforce analytics" />;
}
