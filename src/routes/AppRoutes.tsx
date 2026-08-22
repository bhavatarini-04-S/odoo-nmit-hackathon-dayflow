import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { SignUp } from "../pages/auth/SignUp";
import {
  AdminEmployees,
} from "../pages/admin/Placeholders";
import { EmployeeDashboard } from "../pages/employee/Dashboard";
import { Profile } from "../pages/employee/Profile";
import { Attendance } from "../pages/employee/Attendance";
import { Leave } from "../pages/employee/Leave";
import { Payroll } from "../pages/employee/Payroll";
import { AdminDashboard } from "../pages/admin/Dashboard";
import { AdminAttendance } from "../pages/admin/Attendance";
import { AdminLeaveRequests } from "../pages/admin/LeaveRequests";
import { AdminPayroll } from "../pages/admin/Payroll";
import { AdminAnalytics } from "../pages/admin/Analytics";
import { Landing } from "../pages/public/Landing";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";

const employee = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={["employee"]}>
    <AppLayout>{element}</AppLayout>
  </ProtectedRoute>
);
const admin = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={["admin", "hr"]}>
    <AppLayout>{element}</AppLayout>
  </ProtectedRoute>
);
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/employee/dashboard"
        element={employee(<EmployeeDashboard />)}
      />
      <Route path="/employee/profile" element={employee(<Profile />)} />
      <Route
        path="/employee/attendance"
        element={employee(<Attendance />)}
      />
      <Route path="/employee/leave" element={employee(<Leave />)} />
      <Route path="/employee/payroll" element={employee(<Payroll />)} />
      <Route path="/admin/dashboard" element={admin(<AdminDashboard />)} />
      <Route path="/admin/employees" element={admin(<AdminEmployees />)} />
      <Route path="/admin/attendance" element={admin(<AdminAttendance />)} />
      <Route
        path="/admin/leave-requests"
        element={admin(<AdminLeaveRequests />)}
      />
      <Route path="/admin/payroll" element={admin(<AdminPayroll />)} />
      <Route path="/admin/analytics" element={admin(<AdminAnalytics />)} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
