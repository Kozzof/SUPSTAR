import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { getToken } from '../api/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}