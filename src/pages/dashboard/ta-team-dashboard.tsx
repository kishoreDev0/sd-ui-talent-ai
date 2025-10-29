import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StatCard from '@/components/ui/stat-card';
import {
  Users,
  Send,
  UserCheck,
  FileText,
  Star,
  Archive,
  Clock,
  Activity,
} from 'lucide-react';

const TATeamDashboard: React.FC = () => {
  // TA Executive & Manager Metrics (from image requirements)
  const metrics = {
    profilesSourced: 142,
    activeInterviews: 18,
    offersMade: 12,
    timeToFill: 24,
  };

  const teamActivity = [
    {
      member: 'Alice Chen',
      action: 'Sourced 24 profiles',
      time: '2 hours ago',
      type: 'sourcing',
    },
    {
      member: 'Bob Martinez',
      action: 'Completed 8 screening calls',
      time: '3 hours ago',
      type: 'screening',
    },
    {
      member: 'Carol Kim',
      action: 'Sent 5 offer letters',
      time: '5 hours ago',
      type: 'offer',
    },
    {
      member: 'David Park',
      action: 'Scheduled 12 interviews',
      time: '1 day ago',
      type: 'scheduling',
    },
  ];

  const pipelineMetrics = [
    { stage: 'Sourced', count: 142, target: 150, percentage: 95 },
    { stage: 'Screening', count: 85, target: 90, percentage: 94 },
    { stage: 'Interview', count: 48, target: 60, percentage: 80 },
    { stage: 'Offer', count: 12, target: 15, percentage: 80 },
  ];

  const timeToFillData = [
    {
      role: 'Senior Frontend Developer',
      current: 24,
      target: 20,
      trend: 'down',
    },
    { role: 'Product Designer', current: 19, target: 18, trend: 'up' },
    { role: 'Engineering Manager', current: 28, target: 25, trend: 'down' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">TA Team Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Profiles sourced, active interviews, offers made
        </p>
      </motion.div>

      {/* Executive Metrics: Profiles sourced, active interviews, offers made */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard
          title="Profiles Sourced"
          value={metrics.profilesSourced}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Interviews"
          value={metrics.activeInterviews}
          icon={UserCheck}
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Offers Made"
          value={metrics.offersMade}
          icon={Send}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Time to Fill (Days)"
          value={metrics.timeToFill}
          icon={Clock}
          color="orange"
          trend={{ value: -3, isPositive: true }}
        />
      </div>

      {/* Quick Actions for Resume Validation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Link
          to="/resume-validation"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-bold">Resume Validation</h3>
              <p className="text-blue-100 text-sm">
                Analyze & validate resumes
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/saved-analyses"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <Archive className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-bold">Saved Analyses</h3>
              <p className="text-green-100 text-sm">View saved analyses</p>
            </div>
          </div>
        </Link>

        <Link
          to="/shortlisted-resumes"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <Star className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-bold">Shortlisted Resumes</h3>
              <p className="text-orange-100 text-sm">
                View shortlisted candidates
              </p>
            </div>
          </div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Activity (TA Manager View) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Team Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {teamActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">
                    {activity.member.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {activity.member}
                  </p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Time-to-Fill Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Time-to-Fill by Role
          </h2>
          <div className="space-y-4">
            {timeToFillData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{item.role}</h3>
                  <span
                    className={`text-sm font-medium ${item.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {item.current} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Target: {item.target} days</span>
                  <span className="text-xs text-gray-500">
                    {item.trend === 'down'
                      ? '✓ Improving'
                      : '↑ Needs attention'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Pipeline Metrics
        </h2>
        <div className="space-y-4">
          {pipelineMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">
                    {metric.stage}
                  </span>
                  <span className="text-sm text-gray-600">
                    {metric.count} / {metric.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-sm font-semibold text-gray-900 w-12 text-right">
                {metric.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TATeamDashboard;
