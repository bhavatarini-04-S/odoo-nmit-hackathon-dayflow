import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

// Authentication is connected in Phase 3; this keeps the route seam explicit from Phase 1.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = true;
  return isAuthenticated ? children : <Navigate replace to="/login" />;
}
