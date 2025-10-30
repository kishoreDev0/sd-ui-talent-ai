import React from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';

const AnalyticsPage: React.FC = () => {
  const role = useUserRole();

  return (
    <MainLayout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your hiring metrics</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
