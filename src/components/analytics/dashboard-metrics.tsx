import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Target,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-[#4F39F6] to-[#4F39F6]',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div
            className={`flex items-center mt-2 text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        </div>
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Track your hiring metrics and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Time to Hire"
          value="28 days"
          change={-12}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="blue"
        />
        <MetricCard
          title="Conversion Rate"
          value="12.8%"
          change={8}
          icon={<Target className="w-6 h-6 text-white" />}
          color="green"
        />
        <MetricCard
          title="Active Candidates"
          value="156"
          change={15}
          icon={<Users className="w-6 h-6 text-white" />}
          color="purple"
        />
        <MetricCard
          title="Total Openings"
          value="24"
          change={-5}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Hiring Funnel
          </h3>
          <div className="space-y-4">
            {[
              {
                stage: 'Applied',
                count: 156,
                percentage: 100,
                color: 'bg-blue-500',
              },
              {
                stage: 'Screening',
                count: 78,
                percentage: 50,
                color: 'bg-yellow-500',
              },
              {
                stage: 'Interview',
                count: 45,
                percentage: 29,
                color: 'bg-orange-500',
              },
              {
                stage: 'Offer',
                count: 12,
                percentage: 8,
                color: 'bg-[#4F39F6]',
              },
              {
                stage: 'Hired',
                count: 8,
                percentage: 5,
                color: 'bg-green-500',
              },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.stage}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.count} candidates
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Source Quality
          </h3>
          <div className="space-y-4">
            {[
              { source: 'LinkedIn', candidates: 45, avgScore: 85 },
              { source: 'Referral', candidates: 28, avgScore: 92 },
              { source: 'Job Boards', candidates: 52, avgScore: 72 },
              { source: 'Direct', candidates: 31, avgScore: 78 },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.source}</p>
                  <p className="text-sm text-gray-600">
                    {item.candidates} candidates
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {item.avgScore}%
                  </p>
                  <p className="text-xs text-gray-600">avg match</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
