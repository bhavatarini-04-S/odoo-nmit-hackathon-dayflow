import { employees } from "../mock/mockData";
import type { User } from "../types";
import { mockApi, newMockId } from "./mockApi";

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
export async function createEmployee(
  data: Pick<User, "fullName" | "email" | "role">,
): Promise<User> {
  return mockApi(() => {
    const number = String(employees.length + 1001).padStart(4, "0");
    const user: User = {
      id: newMockId("user"),
      employeeId: `DF-${number}`,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      department: "Unassigned",
      designation: "New hire",
      phone: "",
      address: "",
      profileImage: "",
      joiningDate: new Date().toISOString().slice(0, 10),
    };
    employees.push(user);
    return user;
  });
}
