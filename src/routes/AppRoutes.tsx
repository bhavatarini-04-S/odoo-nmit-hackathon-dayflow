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
import { ProtectedRoute } from "./ProtectedRoute";

const employee = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={["employee"]}>{element}</ProtectedRoute>
);
const admin = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={["admin", "hr"]}>{element}</ProtectedRoute>
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
      <Route path="/employee/profile" element={employee(<EmployeeProfile />)} />
      <Route
        path="/employee/attendance"
        element={employee(<EmployeeAttendance />)}
      />
      <Route path="/employee/leave" element={employee(<EmployeeLeave />)} />
      <Route path="/employee/payroll" element={employee(<EmployeePayroll />)} />
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
