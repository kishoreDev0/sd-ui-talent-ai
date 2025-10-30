import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';

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
  // Support both new structure (first_name, last_name) and old structure (name, username)
  const displayName = userData?.first_name
    ? `${userData.first_name} ${userData.last_name || ''}`.trim() ||
      userData.email ||
      'User'
    : userData?.username ||
      userData?.userName ||
      userData?.name ||
      userData?.email ||
      'User';

  return (
    <main className="p-3 pt-16">
      <h2 className="text-xl font-bold">Hello, {displayName}</h2>
    </main>
  );
};

export default Dashboard;
