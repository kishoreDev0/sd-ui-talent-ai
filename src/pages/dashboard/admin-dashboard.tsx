import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Shield,
  Settings,
  UserCog,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import * as Recharts from 'recharts';

const LineChart = Recharts.LineChart;
const BarChart = Recharts.BarChart;
const PieChart = Recharts.PieChart;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Metrics related to admin features
  const metrics = [
    {
      label: 'Total Users',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      path: '/users',
    },
    {
      label: 'Active Roles',
      value: '6',
      change: '+2',
      trend: 'up',
      icon: Shield,
      color: 'bg-purple-500',
      path: '/admin/access',
    },
    {
      label: 'System Analytics',
      value: '98%',
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
      path: '/analytics',
    },
    {
      label: 'Access Requests',
      value: '8',
      change: '-2',
      trend: 'down',
      icon: BarChart3,
      color: 'bg-orange-500',
      path: '/admin/access',
    },
  ];

  // Chart data for analytics
  const userGrowthData = [
    { month: 'Jan', users: 150, roles: 4 },
    { month: 'Feb', users: 180, roles: 5 },
    { month: 'Mar', users: 200, roles: 5 },
    { month: 'Apr', users: 220, roles: 6 },
    { month: 'May', users: 240, roles: 6 },
    { month: 'Jun', users: 247, roles: 6 },
  ];

  const roleDistributionData = [
    { name: 'Admin', value: 5, color: '#3b82f6' },
    { name: 'TA Executive', value: 25, color: '#10b981' },
    { name: 'TA Manager', value: 15, color: '#f59e0b' },
    { name: 'Hiring Manager', value: 30, color: '#ef4444' },
    { name: 'Interview Panel', value: 50, color: '#8b5cf6' },
    { name: 'HR Ops', value: 15, color: '#ec4899' },
  ];

  const accessActivityData = [
    { day: 'Mon', logins: 45, requests: 12 },
    { day: 'Tue', logins: 52, requests: 15 },
    { day: 'Wed', logins: 48, requests: 10 },
    { day: 'Thu', logins: 61, requests: 18 },
    { day: 'Fri', logins: 55, requests: 14 },
    { day: 'Sat', logins: 32, requests: 8 },
    { day: 'Sun', logins: 28, requests: 5 },
  ];

  const chartConfig = {
    users: {
      label: 'Users',
      color: 'hsl(var(--chart-1))',
    },
    roles: {
      label: 'Roles',
      color: 'hsl(var(--chart-2))',
    },
  };

  const recentActivity = [
    {
      id: 1,
      action: 'New user registered',
      resource: 'john.doe@example.com',
      time: '2 hours ago',
    },
    {
      id: 2,
      action: 'Role permissions updated',
      resource: 'TA_Executive role',
      time: '5 hours ago',
    },
    {
      id: 3,
      action: 'Access control modified',
      resource: 'Admin permissions',
      time: '1 day ago',
    },
    {
      id: 4,
      action: 'User activated',
      resource: 'jane.smith@example.com',
      time: '2 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-2 sm:p-3 md:p-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Metrics Grid - Based on admin menu items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  onClick={() => navigate(metric.path)}
                >
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`${metric.color} p-2 rounded-lg shadow-md`}
                      >
                        <Icon className="h-4 w-4 text-white" />
          </div>
                      <span
                        className={`text-xs font-semibold ${
                          metric.trend === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {metric.change}
                      </span>
          </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                      {metric.value}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions - Based on admin menu items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-3"
        >
          <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
              <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Access admin features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => navigate('/users')}
                  className="group p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-[10px] sm:text-xs">
                    Manage Users
                  </p>
                  <p className="text-blue-100 text-[9px] sm:text-[10px]">View all users</p>
                </button>
                <button
                  onClick={() => navigate('/admin/access')}
                  className="group p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full"
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-[10px] sm:text-xs">
                    Access Control
                  </p>
                  <p className="text-purple-100 text-[9px] sm:text-[10px]">
                    Manage roles & permissions
                  </p>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="group p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full"
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-[10px] sm:text-xs">Analytics</p>
                  <p className="text-green-100 text-[9px] sm:text-[10px]">
                    View system analytics
                  </p>
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="group p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-[10px] sm:text-xs">Settings</p>
                  <p className="text-orange-100 text-[9px] sm:text-[10px]">System settings</p>
                </button>
      </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section - User Growth & Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
          {/* User Growth Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
              <CardTitle className="text-sm sm:text-base">User Growth Trend</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Users and roles over time
              </CardDescription>
            </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full overflow-x-auto">
                  <LineChart data={userGrowthData} width={undefined} height={undefined}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="roles"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
              <CardTitle className="text-sm sm:text-base">Role Distribution</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Users by role
              </CardDescription>
            </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full">
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        entry.percent
                          ? `${(entry.percent * 100).toFixed(0)}%`
                          : ''
                      }
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend
                      wrapperStyle={{ fontSize: '10px' }}
                      formatter={(value) => (
                        <span style={{ fontSize: '10px' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Access Activity & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 mb-3">
          {/* Access Activity Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
              <CardTitle className="text-sm sm:text-base">Access Activity</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Daily logins and permission requests
              </CardDescription>
            </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] w-full overflow-x-auto">
                  <BarChart data={accessActivityData} width={undefined} height={undefined}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="logins"
                      fill="hsl(var(--chart-1))"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="requests"
                      fill="hsl(var(--chart-2))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base">User Management</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/users')}
                    className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs w-full sm:w-auto"
                  >
                    View All
                  </Button>
              </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/users')}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          Manage Users
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          View and edit user accounts
                        </p>
              </div>
                      <UserCog className="h-3 w-3 text-gray-400" />
            </div>
                  </button>
                  <button
                    onClick={() => navigate('/admin/access')}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          Access Control
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          Manage roles and permissions
                        </p>
              </div>
                      <Shield className="h-3 w-3 text-gray-400" />
            </div>
                  </button>
            </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader className="p-2 sm:p-3 pb-2">
              <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Latest admin actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {activity.action}
                  </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      {activity.resource}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {activity.time}
                  </p>
                </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
