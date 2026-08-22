import { createEmployee, findEmployeeByEmail } from "./employeeService";
import type { User } from "../types";
const demoPassword = "dayflow123";
export async function signIn(email: string, password: string): Promise<User> {
  const user = await findEmployeeByEmail(email);
  if (!user || password !== demoPassword)
    throw new Error(
      "Use a seeded Dayflow email and the demo password: dayflow123.",
    );
  return user;
}
export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<User> {
  if (password.length < 8)
    throw new Error("Password must be at least 8 characters.");
  if (await findEmployeeByEmail(email))
    throw new Error("An account already exists for this email.");
  return createEmployee({ fullName, email, role: "employee" });
}
