import React from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';

const SettingsPage: React.FC = () => {
  const role = useUserRole();

  return (
    <MainLayout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your settings</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
