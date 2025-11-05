import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '@/components/ui/stat-card';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Package,
} from 'lucide-react';

const HROpsDashboard: React.FC = () => {
  const stats = {
    offersSent: 15,
    joiningStatus: 8,
    onboardingDocs: 12,
    pendingVerification: 5,
  };

  const onboardingTasks = [
    {
      id: 1,
      candidate: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      status: 'Pending',
      priority: 'High',
    },
    {
      id: 2,
      candidate: 'John Doe',
      position: 'Product Designer',
      status: 'In Progress',
      priority: 'Medium',
    },
    {
      id: 3,
      candidate: 'Emily Chen',
      position: 'Engineering Manager',
      status: 'Completed',
      priority: 'High',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          HR Operations Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage offers, onboarding, and documentation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Offers Sent"
          value={stats.offersSent}
          icon={Send}
          color="blue"
        />
        <StatCard
          title="Joining Status"
          value={stats.joiningStatus}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Onboarding Docs"
          value={stats.onboardingDocs}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Onboarding Tasks
          </h2>
          <div className="space-y-4">
            {onboardingTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all bg-white dark:bg-slate-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {task.candidate}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.position}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Priority: {task.priority}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Send Offer Letter</span>
            </button>
            <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Prepare Onboarding Docs</span>
            </button>
            <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Update Joining Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HROpsDashboard;
