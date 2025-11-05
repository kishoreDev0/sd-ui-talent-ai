import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Plus, Search, Filter, Briefcase } from 'lucide-react';
import { useUserRole } from '@/utils/getUserRole';

const JobsPage: React.FC = () => {
  const role = useUserRole();

  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      status: 'Open',
      candidates: 24,
      postedDate: 'Oct 15, 2024',
    },
    {
      id: 2,
      title: 'Product Designer',
      department: 'Design',
      location: 'New York, NY',
      status: 'Open',
      candidates: 18,
      postedDate: 'Oct 18, 2024',
    },
    {
      id: 3,
      title: 'Engineering Manager',
      department: 'Engineering',
      location: 'Remote',
      status: 'Open',
      candidates: 32,
      postedDate: 'Oct 20, 2024',
    },
    {
      id: 4,
      title: 'Data Scientist',
      department: 'Data',
      location: 'Boston, MA',
      status: 'Paused',
      candidates: 15,
      postedDate: 'Oct 10, 2024',
    },
    {
      id: 5,
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'Seattle, WA',
      status: 'Open',
      candidates: 28,
      postedDate: 'Oct 22, 2024',
    },
  ];

  return (
    <MainLayout role={role}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-2">Manage your job postings</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Job</span>
          </button>
        </motion.div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {job.department} • {job.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Posted on {job.postedDate}</span>
                      <span>•</span>
                      <span>{job.candidates} candidates</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'Open'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : job.status === 'Paused'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {job.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobsPage;
