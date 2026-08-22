import { leaves } from "../mock/mockData";
import type { Leave, LeaveStatus, LeaveType } from "../types";
import { mockApi, newMockId } from "./mockApi";

export async function getLeaves(filters?: {
  employeeId?: string;
  status?: LeaveStatus;
}): Promise<Leave[]> {
  return mockApi(() =>
    leaves.filter(
      (item) =>
        (!filters?.employeeId || item.employeeId === filters.employeeId) &&
        (!filters?.status || item.status === filters.status),
    ),
  );
}
export async function createLeave(
  request: Omit<Leave, "id" | "status" | "adminComment">,
): Promise<Leave> {
  return mockApi(() => {
    const leave: Leave = {
      ...request,
      id: newMockId("leave"),
      status: "Pending",
      adminComment: null,
    };
    leaves.unshift(leave);
    return leave;
  });
}
export async function decideLeave(
  id: string,
  status: Exclude<LeaveStatus, "Pending">,
  adminComment: string | null = null,
): Promise<Leave> {
  return mockApi(() => {
    const leave = leaves.find((item) => item.id === id);
    if (!leave) throw new Error("Leave request not found");
    leave.status = status;
    leave.adminComment = adminComment;
    return leave;
  });
}
export type { LeaveType };
