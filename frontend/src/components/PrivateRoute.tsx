import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Smart redirect based on role if unauthorized
    switch (user.role) {
      case 'EXECUTIVE': return <Navigate to="/executive" replace />;
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'COORDINATOR': return <Navigate to="/regional" replace />;
      case 'SUB_REGIONAL': return <Navigate to="/sub-regional" replace />;
      case 'AREA_STAFF': return <Navigate to="/" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
