import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    {
      label: 'Profiles Sourced',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Interviews',
      value: '18',
      change: '+3',
      trend: 'up',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      label: 'Offers Made',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: CheckCircle2,
      color: 'bg-green-500',
    },
    {
      label: 'Time to Fill',
      value: '12 days',
      change: '-2 days',
      trend: 'down',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New job posted',
      resource: 'Senior Frontend Developer',
      time: '2 hours ago',
    },
    {
      id: 2,
      action: 'Candidate shortlisted',
      resource: 'Sarah Johnson',
      time: '5 hours ago',
    },
    {
      id: 3,
      action: 'Interview scheduled',
      resource: 'Michael Chen',
      time: '1 day ago',
    },
    {
      id: 4,
      action: 'Offer sent',
      resource: 'Emily Davis',
      time: '2 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                TA Executive Dashboard
              </h1>
              <p className="text-gray-600">
                Full create/edit permissions • Job Management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/register-job')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/candidates/register')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.color} p-3 rounded-2xl shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm text-gray-600">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/register-job')}
              className="group p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <Briefcase className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Create Job</p>
              <p className="text-purple-100 text-xs">Post new position</p>
            </button>
            <button
              onClick={() => navigate('/candidates/register')}
              className="group p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <Users className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Add Candidate</p>
              <p className="text-blue-100 text-xs">Register new candidate</p>
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="group p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <FileText className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Job Board</p>
              <p className="text-green-100 text-xs">View all jobs</p>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="group p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <BarChart3 className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Analytics</p>
              <p className="text-orange-100 text-xs">View reports</p>
            </button>
          </div>
        </motion.div>

        {/* Job Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Job Management
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/jobs')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/register-job')}
                className="w-full p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all border border-white/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Create New Job
                    </p>
                    <p className="text-sm text-gray-600">
                      Post a new job opening
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
              </button>
              <button
                onClick={() => navigate('/organizations')}
                className="w-full p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all border border-white/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Manage Organizations
                    </p>
                    <p className="text-sm text-gray-600">
                      Add or edit organizations
                    </p>
                  </div>
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-white/50 rounded-xl border border-white/30"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.resource}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Pipeline Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Sourced', count: 247, color: 'bg-blue-500' },
              { label: 'Screening', count: 45, color: 'bg-yellow-500' },
              { label: 'Interview', count: 18, color: 'bg-purple-500' },
              { label: 'Offer', count: 8, color: 'bg-green-500' },
            ].map((stage) => (
              <div
                key={stage.label}
                className="p-4 bg-white/50 rounded-xl border border-white/30 text-center"
              >
                <div
                  className={`${stage.color} w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold`}
                >
                  {stage.count}
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {stage.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TAExecutiveDashboard;
