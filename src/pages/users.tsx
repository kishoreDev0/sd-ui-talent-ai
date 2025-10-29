import React from 'react';
import { MainLayout } from '@/components/layout';

const UsersPage: React.FC = () => (
  <MainLayout role="admin">
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage team members</p>
      </div>
    </div>
  </MainLayout>
);

export default UsersPage;
