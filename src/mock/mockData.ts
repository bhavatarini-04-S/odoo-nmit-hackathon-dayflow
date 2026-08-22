import attendanceSeed from "./attendance.json";
import employeesSeed from "./employees.json";
import leavesSeed from "./leaves.json";
import notificationsSeed from "./notifications.json";
import payrollSeed from "./payroll.json";
import type { Attendance, Leave, Notification, Payroll, User } from "../types";

export const employees: User[] = structuredClone(employeesSeed) as User[];
export const attendance: Attendance[] = structuredClone(
  attendanceSeed,
) as Attendance[];
export const leaves: Leave[] = structuredClone(leavesSeed) as Leave[];
export const payroll: Payroll[] = structuredClone(payrollSeed) as Payroll[];
export const notifications: Notification[] = structuredClone(
  notificationsSeed,
) as Notification[];
