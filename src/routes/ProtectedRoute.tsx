import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

// Authentication is connected in Phase 3; this keeps the route seam explicit from Phase 1.
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate replace to="/login" />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <Navigate
        replace
        to={
          currentUser.role === "employee"
            ? "/employee/dashboard"
            : "/admin/dashboard"
        }
      />
    );
  }
  return children;
}
