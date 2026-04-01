import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

//   If no token, redirect to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
//  If token exists, render children
  return <>{children}</>;
}
