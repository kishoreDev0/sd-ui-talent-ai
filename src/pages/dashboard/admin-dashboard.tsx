import React from 'react';
import StatCard from '@/components/ui/stat-card';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  Activity,
  Clock,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = {
    totalJobs: 24,
    activeCandidates: 156,
    upcomingInterviews: 12,
    hiresThisMonth: 8,
  };

  const recentActivity = [
    {
      id: 1,
      action: 'New candidate applied',
      target: 'Sarah Johnson - Product Designer',
      time: '2 min ago',
      icon: '👤',
    },
    {
      id: 2,
      action: 'Interview scheduled',
      target: 'Tech Lead Interview - John Doe',
      time: '15 min ago',
      icon: '📅',
    },
    {
      id: 3,
      action: 'Job posted',
      target: 'Senior Frontend Developer',
      time: '1 hour ago',
      icon: '💼',
    },
    {
      id: 4,
      action: 'Feedback submitted',
      target: 'Emily Chen - Engineering Manager',
      time: '2 hours ago',
      icon: '✍️',
    },
  ];

  const metrics = [
    {
      label: 'Opened',
      value: '$ 68,245',
      color: 'from-blue-500 to-purple-500',
    },
    {
      label: 'Clicked',
      value: '$ 86,764',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Interested',
      value: '$ 38,235',
      color: 'from-pink-500 to-orange-500',
    },
    {
      label: 'Bounced',
      value: '$ 34,856',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 space-y-8 p-6">
      {/* Header Section with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      {/* Modern Metrics Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group`}
          >
            <div
              className={`bg-gradient-to-br ${metric.color} rounded-2xl p-4 text-white shadow-lg`}
            >
              <h3 className="text-sm font-semibold text-white/90 mb-2">
                {metric.label}
              </h3>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                +12% from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Progress Bar with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30">
        <div className="relative h-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full overflow-hidden shadow-inner">
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>System Performance</span>
          <span className="font-semibold">87% Optimized</span>
        </div>
      </div>

      {/* Main Stats and Activity with Modern Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Cards */}
        <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalJobs}
                </p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              +12% from last month
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeCandidates}
                </p>
                <p className="text-sm text-gray-600">Active Candidates</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              +8% from last month
            </div>
          </div>
        </div>

        {/* Main Activity Area with Glassmorphism */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span>Recent Activity</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300 border border-transparent hover:border-white/50 hover:shadow-lg"
              >
                <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base group-hover:text-gray-700 transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 truncate group-hover:text-gray-500 transition-colors">
                    {activity.target}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500 flex-shrink-0">
                  <Clock className="w-4 h-4 mr-2" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Upcoming Interviews"
          value={stats.upcomingInterviews}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Hires This Month"
          value={stats.hiresThisMonth}
          icon={CheckCircle2}
          color="purple"
          trend={{ value: 15, isPositive: true }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
