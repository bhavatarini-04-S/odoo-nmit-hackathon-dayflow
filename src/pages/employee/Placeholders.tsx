import { ComingSoon } from "../../components/common/ComingSoon";
import { AppLayout } from "../../components/layout/AppLayout";
function EmployeePage({ title }: { title: string }) {
  return (
    <AppLayout>
      <ComingSoon title={title} />
    </AppLayout>
  );
}
export function EmployeeDashboard() {
  return <EmployeePage title="Employee dashboard" />;
}
export function EmployeeProfile() {
  return <EmployeePage title="My profile" />;
}
export function EmployeeAttendance() {
  return <EmployeePage title="My attendance" />;
}
export function EmployeeLeave() {
  return <EmployeePage title="Leave management" />;
}
export function EmployeePayroll() {
  return <EmployeePage title="My payroll" />;
}
