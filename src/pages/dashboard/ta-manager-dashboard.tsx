import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  FileText,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const teamMetrics = [
    {
      label: 'Team Activity',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      label: 'Time to Fill',
      value: '14 days',
      change: '-2 days',
      trend: 'down',
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      label: 'Pipeline Metrics',
      value: '312',
      change: '+24',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Target Achievement',
      value: '92%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'bg-orange-500',
    },
  ];

  const teamReports = [
    {
      title: 'Team Performance Report',
      period: 'This Month',
      metrics: {
        sourced: 156,
        interviews: 42,
        offers: 12,
      },
    },
    {
      title: 'Pipeline Health',
      period: 'Last 30 Days',
      metrics: {
        conversion: '18.5%',
        avgTime: '14 days',
        dropoff: '8%',
      },
    },
    {
      title: 'Team Productivity',
      period: 'Weekly',
      metrics: {
        tasksCompleted: 89,
        avgResponse: '2.3 hrs',
        activeMembers: 12,
      },
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
                TA Manager Dashboard
              </h1>
              <p className="text-gray-600">
                Team activity, time-to-fill, pipeline metrics
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Reports
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {teamMetrics.map((metric, index) => {
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

        {/* Team Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {teamReports.map((report, index) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="backdrop-blur-xl bg-white/60 rounded-3xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {report.title}
                </h3>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">{report.period}</p>
              <div className="space-y-2">
                {Object.entries(report.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Team Pipeline Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Sourced',
                count: 312,
                color: 'bg-blue-500',
                team: 'All',
              },
              {
                label: 'In Screening',
                count: 89,
                color: 'bg-yellow-500',
                team: 'Active',
              },
              {
                label: 'Interviewing',
                count: 42,
                color: 'bg-purple-500',
                team: 'Scheduled',
              },
              {
                label: 'Offers Extended',
                count: 12,
                color: 'bg-green-500',
                team: 'Pending',
              },
            ].map((stage) => (
              <div
                key={stage.label}
                className="p-4 bg-white/50 rounded-xl border border-white/30 text-center"
              >
                <div
                  className={`${stage.color} w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl`}
                >
                  {stage.count}
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {stage.label}
                </p>
                <p className="text-xs text-gray-500">{stage.team} Team</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Team Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                member: 'Sarah Wilson',
                action: 'Sourced 12 candidates',
                time: '2 hours ago',
              },
              {
                member: 'Mike Johnson',
                action: 'Completed 3 interviews',
                time: '4 hours ago',
              },
              {
                member: 'David Brown',
                action: 'Scheduled 5 interviews',
                time: '6 hours ago',
              },
              {
                member: 'Emily Davis',
                action: 'Posted 2 new jobs',
                time: '1 day ago',
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/30"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {activity.member.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.member}
                  </p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TAManagerDashboard;
