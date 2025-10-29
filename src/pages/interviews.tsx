import React from 'react';
import { MainLayout } from '@/components/layout';

const InterviewsPage: React.FC = () => (
  <MainLayout role="interviewer">
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Interviews</h1>
        <p className="text-gray-600 mt-2">Schedule and conduct interviews</p>
      </div>
    </div>
  </MainLayout>
);

export default InterviewsPage;
