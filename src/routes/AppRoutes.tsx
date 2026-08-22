import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import {
  AdminAnalytics,
  AdminAttendance,
  AdminDashboard,
  AdminEmployees,
  AdminLeaveRequests,
  AdminPayroll,
} from "../pages/admin/Placeholders";
import {
  EmployeeAttendance,
  EmployeeDashboard,
  EmployeeLeave,
  EmployeePayroll,
  EmployeeProfile,
} from "../pages/employee/Placeholders";
import { Landing } from "../pages/public/Landing";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/profile" element={<EmployeeProfile />} />
      <Route path="/employee/attendance" element={<EmployeeAttendance />} />
      <Route path="/employee/leave" element={<EmployeeLeave />} />
      <Route path="/employee/payroll" element={<EmployeePayroll />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/employees" element={<AdminEmployees />} />
      <Route path="/admin/attendance" element={<AdminAttendance />} />
      <Route path="/admin/leave-requests" element={<AdminLeaveRequests />} />
      <Route path="/admin/payroll" element={<AdminPayroll />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
