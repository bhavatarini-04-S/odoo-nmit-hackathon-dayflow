import { attendance } from "../mock/mockData";
import type { Attendance, AttendanceStatus } from "../types";
import { mockApi, newMockId } from "./mockApi";

export async function getAttendance(filters?: {
  employeeId?: string;
  date?: string;
  status?: AttendanceStatus;
}): Promise<Attendance[]> {
  return mockApi(() =>
    attendance.filter(
      (item) =>
        (!filters?.employeeId || item.employeeId === filters.employeeId) &&
        (!filters?.date || item.date === filters.date) &&
        (!filters?.status || item.status === filters.status),
    ),
  );
}
export async function checkIn(
  employeeId: string,
  date: string,
  time: string,
): Promise<Attendance> {
  return mockApi(() => {
    const record = attendance.find(
      (item) => item.employeeId === employeeId && item.date === date,
    );
    if (record) {
      record.checkIn = time;
      record.status = "Present";
      return record;
    }
    const created: Attendance = {
      id: newMockId("attendance"),
      employeeId,
      date,
      checkIn: time,
      checkOut: null,
      status: "Present",
    };
    attendance.unshift(created);
    return created;
  });
}
export async function checkOut(
  employeeId: string,
  date: string,
  time: string,
): Promise<Attendance> {
  return mockApi(() => {
    const record = attendance.find(
      (item) => item.employeeId === employeeId && item.date === date,
    );
    if (!record) throw new Error("Check in before checking out");
    record.checkOut = time;
    return record;
  });
}
