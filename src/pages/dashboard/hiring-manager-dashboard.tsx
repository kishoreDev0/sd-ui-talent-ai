import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '@/components/ui/stat-card';
import {
  FileText,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  MessageSquare,
} from 'lucide-react';

const HiringManagerDashboard: React.FC = () => {
  // Dashboard: Candidates to review, score history
  const stats = {
    candidatesToReview: 12,
    pendingShortlist: 8,
    commented: 24,
    avgScore: 78,
  };

  const candidatesToReview = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Designer',
      score: 85,
      match: 92,
      status: 'new',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Frontend Developer',
      score: 78,
      match: 88,
      status: 'new',
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'UI/UX Designer',
      score: 82,
      match: 90,
      status: 'reviewing',
    },
    {
      id: 4,
      name: 'David Park',
      role: 'Engineering Manager',
      score: 88,
      match: 95,
      status: 'new',
    },
  ];

  const scoreHistory = [
    { date: 'Oct 25', candidates: 15, avgScore: 82, trend: 'up' },
    { date: 'Oct 24', candidates: 12, avgScore: 79, trend: 'down' },
    { date: 'Oct 23', candidates: 18, avgScore: 85, trend: 'up' },
    { date: 'Oct 22', candidates: 10, avgScore: 75, trend: 'down' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Hiring Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Candidates to review, score history
          </p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2">
          <span>+</span>
          <span>Create Job</span>
        </button>
      </motion.div>

      {/* Permissions: Comment & Shortlisting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Candidates to Review"
          value={stats.candidatesToReview}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pending Shortlist"
          value={stats.pendingShortlist}
          icon={Star}
          color="orange"
        />
        <StatCard
          title="Commented"
          value={stats.commented}
          icon={MessageSquare}
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={stats.avgScore}
          icon={UserCheck}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidates to Review */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Candidates to Review
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {candidatesToReview.map((candidate) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.role}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                  >
                    {candidate.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      Score:{' '}
                      <span className="font-semibold text-gray-900">
                        {candidate.score}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Match:{' '}
                      <span className="font-semibold text-blue-600">
                        {candidate.match}%
                      </span>
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                      Shortlist
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                      Comment
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Score History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Score History
          </h2>
          <div className="space-y-4">
            {scoreHistory.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">
                      {day.candidates} candidates reviewed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Avg: {day.avgScore}
                    </p>
                  </div>
                  {day.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringManagerDashboard;
