import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/login/authState';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  // TEMPORARY: Bypass authentication for demo
  const BYPASS_AUTH = true;
  const { isAuthenticated } = useAuth();
  const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';

  if (!BYPASS_AUTH && !isAuthenticated && !localStorageAuth) {
    return <Navigate to="/login" replace />;
  }

  // Set up mock user data for demo
  if (BYPASS_AUTH) {
    const mockUser = {
      name: 'Demo User',
      username: 'demo@company.com',
      email: 'demo@company.com',
      role: 'admin', // Change to 'admin', 'ta_executive', 'ta_manager', 'hiring_manager', 'interviewer', 'hr_ops'
      roleId: 1,
    };
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('isAuthenticated', 'true');
    }
  }

  return <>{element}</>;
};

export default PrivateRoute;
