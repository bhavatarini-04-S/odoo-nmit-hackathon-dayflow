import { employees } from "../mock/mockData";
import type { User } from "../types";
import { mockApi } from "./mockApi";

export async function getEmployees(): Promise<User[]> {
  return mockApi(() => employees);
}
export async function getEmployeeById(id: string): Promise<User | undefined> {
  return mockApi(() =>
    employees.find(
      (employee) => employee.id === id || employee.employeeId === id,
    ),
  );
}
export async function updateEmployee(
  id: string,
  changes: Partial<User>,
): Promise<User> {
  return mockApi(() => {
    const employee = employees.find((item) => item.id === id);
    if (!employee) throw new Error("Employee not found");
    Object.assign(employee, changes);
    return employee;
  });
}
export async function findEmployeeByEmail(
  email: string,
): Promise<User | undefined> {
  return mockApi(
    () =>
      employees.find(
        (employee) => employee.email.toLowerCase() === email.toLowerCase(),
      ),
    250,
  );
}
