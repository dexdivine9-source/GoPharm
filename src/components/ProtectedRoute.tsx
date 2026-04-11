import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase, Role } from '../lib/mock-db';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: Role;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ children, requireRole, requireVerified }: ProtectedRouteProps) {
  const { currentUser } = useSupabase();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && currentUser.role !== requireRole) {
    if (currentUser.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    }
    if (currentUser.role === 'pharmacy') {
      return <Navigate to={currentUser.is_verified ? "/portal" : "/pending-verification"} replace />;
    }
  }

  // Handle Verification specific routing for pharmacies
  if (requireRole === 'pharmacy' && requireVerified !== undefined) {
    if (requireVerified && !currentUser.is_verified) {
      return <Navigate to="/pending-verification" replace />;
    }
    if (!requireVerified && currentUser.is_verified) {
      return <Navigate to="/portal" replace />;
    }
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useSupabase();

  if (currentUser) {
    if (currentUser.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    }
    if (currentUser.role === 'pharmacy') {
      return <Navigate to={currentUser.is_verified ? "/portal" : "/pending-verification"} replace />;
    }
  }

  return <>{children}</>;
}
