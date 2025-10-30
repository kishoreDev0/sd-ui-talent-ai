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

  // Strict role-based rendering: no localStorage, no dynamic fallbacks
  const role: UserRole = user?.role?.name || 'admin';
  const roleId: number | undefined = user?.role?.id;

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
        // Fallback strictly by role name if id missing
        if (role === 'interviewer') return <InterviewerDashboard />;
        if (role === 'hiring_manager') return <HiringManagerDashboard />;
        if (role === 'ta_manager') return <TAManagerDashboard />;
        if (role === 'ta_executive') return <TAExecutiveDashboard />;
        if (role === 'hr_ops') return <HROpsDashboard />;
        return <AdminDashboard />;
    }
  };

  return <MainLayout role={role}>{renderDashboard()}</MainLayout>;
};

export default DashboardRouter;
