import React from 'react';
import { useAppSelector } from '@/store';
import { MainLayout } from '@/components/layout';
import AdminDashboard from './admin-dashboard';
import TAExecutiveDashboard from './ta-executive-dashboard';
import TAManagerDashboard from './ta-manager-dashboard';
import HiringManagerDashboard from './hiring-manager-dashboard';
import InterviewerDashboard from './interviewer-dashboard';
import HROpsDashboard from './hr-ops-dashboard';
import { UserRole } from '@/types';

const DashboardRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Strict role ID-based rendering with localStorage fallback for reloads
  const storedUser = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null;
  const roleId: number | undefined =
    user?.role?.id ?? user?.role_id ?? storedUser?.role?.id ?? storedUser?.role_id;

  const renderDashboard = () => {
    switch (roleId) {
      case 1: // admin
        return <AdminDashboard />;
      case 2: // ta_executive
        return <TAExecutiveDashboard />;
      case 3: // ta_manager
        return <TAManagerDashboard />;
      case 4: // hiring_manager
        return <HiringManagerDashboard />;
      case 5: // interviewer
        return <InterviewerDashboard />;
      case 6: // hr_ops
        return <HROpsDashboard />;
      default:
        return null;
    }
  };

  // Pass a role string only for display; comparisons use roleId strictly
  const roleForDisplay: UserRole =
    roleId === 1
      ? 'admin'
      : roleId === 2
        ? 'ta_executive'
        : roleId === 3
          ? 'ta_manager'
          : roleId === 4
            ? 'hiring_manager'
            : roleId === 5
              ? 'interviewer'
              : 'hr_ops';

  if (!roleId) {
    return <MainLayout role={'admin'}>{null}</MainLayout>;
  }
  return <MainLayout role={roleForDisplay}>{renderDashboard()}</MainLayout>;
};

export default DashboardRouter;
