import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/login/authState';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';
  const hasAccessToken = !!localStorage.getItem('access_token');

  if (!(isAuthenticated || localStorageAuth || hasAccessToken)) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

export default PrivateRoute;
