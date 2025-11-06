import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  const getColorClass = () => {
    if (color === '#4F39F6' || color === 'purple') {
      return 'bg-[#4F39F6]';
    }
    const colorClasses: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
      green: 'bg-gradient-to-br from-green-500 to-green-600',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
      purple: 'bg-[#4F39F6]',
    };
    return colorClasses[color || 'blue'] || 'bg-[#4F39F6]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-900/70 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${getColorClass()} p-3 rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
