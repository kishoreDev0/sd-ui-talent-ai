import React from 'react';
import { useAppSelector } from '@/store';
import { MainLayout } from '@/components/layout';
import AdminDashboard from './admin-dashboard';
import HiringManagerDashboard from './hiring-manager-dashboard';
import InterviewerDashboard from './interviewer-dashboard';
import TATeamDashboard from './ta-team-dashboard';
import HROpsDashboard from './hr-ops-dashboard';
import { UserRole } from '@/types';

const DashboardRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Get user role from user data
  const getUserRole = (): UserRole => {
    const userData =
      user ||
      (localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null);

    // For demo purposes, return a default role if not set
    // In production, this would come from the authenticated user
    const role = userData?.role || 'admin';

    // Map role to our UserRole type
    if (role === 'admin') return 'admin';
    if (role === 'hiring_manager') return 'hiring_manager';
    if (role === 'interviewer') return 'interviewer';
    if (role === 'ta_team') return 'ta_team';
    if (role === 'hr_ops' || role === 'hr_op') return 'hr_ops';

    // Default to admin for demo
    return 'admin';
  };

  const role = getUserRole();

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'hiring_manager':
        return <HiringManagerDashboard />;
      case 'interviewer':
        return <InterviewerDashboard />;
      case 'ta_team':
        return <TATeamDashboard />;
      case 'hr_ops':
        return <HROpsDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return <MainLayout role={role}>{renderDashboard()}</MainLayout>;
};

export default DashboardRouter;
