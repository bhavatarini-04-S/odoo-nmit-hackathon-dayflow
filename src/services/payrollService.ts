import { payroll } from "../mock/mockData";
import type { Payroll } from "../types";
import { mockApi, newMockId } from "./mockApi";

export async function getPayroll(filters?: {
  employeeId?: string;
  month?: number;
  year?: number;
}): Promise<Payroll[]> {
  return mockApi(() =>
    payroll.filter(
      (item) =>
        (!filters?.employeeId || item.employeeId === filters.employeeId) &&
        (!filters?.month || item.month === filters.month) &&
        (!filters?.year || item.year === filters.year),
    ),
  );
}
export async function savePayroll(
  record: Omit<Payroll, "id" | "netSalary"> & { id?: string },
): Promise<Payroll> {
  return mockApi(() => {
    const netSalary =
      record.basicSalary + record.allowances - record.deductions;
    const existing = record.id
      ? payroll.find((item) => item.id === record.id)
      : undefined;
    if (existing) {
      Object.assign(existing, record, { netSalary });
      return existing;
    }
    const created: Payroll = { ...record, id: newMockId("payroll"), netSalary };
    payroll.unshift(created);
    return created;
  });
}
