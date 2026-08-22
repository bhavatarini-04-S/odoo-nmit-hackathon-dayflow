export type Role = "employee" | "admin" | "hr";
export type AttendanceStatus = "Present" | "Absent" | "Half-Day" | "Leave";
export type LeaveType = "Paid" | "Sick" | "Unpaid";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type NotificationType = "info" | "success" | "warning" | "alert";
export interface User {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  phone: string;
  address: string;
  profileImage: string;
  joiningDate: string;
}
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}
export interface Leave {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  remarks: string;
  status: LeaveStatus;
  adminComment: string | null;
}
export interface Payroll {
  id: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: number;
  year: number;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
