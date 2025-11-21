import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import RealTimeDashboard from '@/components/dashboard/real-time-dashboard';
import AdminDashboard from '@/pages/dashboard/admin-dashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated && !localStorageAuth) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const userData =
    user ||
    (localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null);

  if (!userData) {
    return (
      <div className="min-h-screen bg-[var(--gray-50)] flex justify-center items-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--button)] border-r-transparent"></div>
      </div>
    );
  }

  const userRole = userData?.role?.name || 'admin';
  const isAdmin = userRole === 'admin';
  
  // Show admin dashboard for admin users
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  // Show regular dashboard for other users
  return (
    <main className="p-3 pt-16">
      <h2 className="text-xl font-bold">Hello, {displayName}</h2>
      <RealTimeDashboard userRole={userRole} />
    </main>
  );
};

export default Dashboard;
