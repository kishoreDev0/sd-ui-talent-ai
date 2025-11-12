import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { PieLabelRenderProps } from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAllUsers } from '@/store/user/actions/userActions';

const LineChart = Recharts.LineChart;
const BarChart = Recharts.BarChart;
const PieChart = Recharts.PieChart;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Metrics related to admin features
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(
      getAllUsers({
        page: 1,
        page_size: 200,
      }),
    );
  }, [dispatch]);

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
      color: 'bg-[#4F39F6]',
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

  const fallbackRoleDistribution = [
    { name: 'Admin', value: 12, color: '#3b82f6' },
    { name: 'TA Executive', value: 38, color: '#10b981' },
    { name: 'TA Manager', value: 22, color: '#f59e0b' },
    { name: 'Hiring Manager', value: 47, color: '#ef4444' },
    { name: 'Interview Panel', value: 63, color: '#8b5cf6' },
    { name: 'HR Ops', value: 18, color: '#ec4899' },
  ];

  const roleDistributionData = useMemo(() => {
    if (!users || users.length === 0) {
      return fallbackRoleDistribution;
    }

    const colorPalette = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316',
    ];

    const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
      const roleInfo =
        (user.role as {
          display_name?: string;
          name?: string;
          description?: string;
        }) || {};
      const roleLabel =
        roleInfo.display_name ||
        roleInfo.name ||
        roleInfo.description ||
        'Unassigned';
      acc[roleLabel] = (acc[roleLabel] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleCounts).map(([name, value], index) => ({
      name,
      value,
      color: colorPalette[index % colorPalette.length],
    }));
  }, [users]);

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

  const pipelineStages = [
    {
      label: 'Applied',
      count: 120,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Screening',
      count: 45,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Interview Scheduled',
      count: 18,
      gradient: 'from-[#4F39F6] to-[#4F39F6]',
    },
    {
      label: 'Feedback Pending',
      count: 12,
      gradient: 'from-[#4F39F6] to-[#4F39F6]',
    },
    {
      label: 'Offer Sent',
      count: 8,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Hired / Rejected',
      count: 30,
      gradient: 'from-slate-500 to-gray-600',
    },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-transparent p-3 sm:p-5 lg:p-2">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Admin Control Center
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Monitor system usage, manage roles, and stay ahead of access
              requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-full rounded-2xl border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800 sm:w-auto"
              onClick={() => navigate('/analytics')}
            >
              View analytics
            </Button>
            <Button
              className="h-8 w-full rounded-2xl bg-purple-600 px-3 text-xs font-semibold text-white shadow hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 sm:w-auto"
              onClick={() => navigate('/users')}
            >
              <UserCog className="mr-1.5 h-3.5 w-3.5" />
              Manage users
            </Button>
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
              Key indicators
            </h2>
            <button className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
              Export summary
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
            const Icon = metric.icon;
              const trendColor =
                metric.trend === 'up'
                  ? 'text-emerald-500 dark:text-emerald-300'
                  : 'text-orange-500 dark:text-orange-300';
            return (
                <button
                key={metric.label}
                  onClick={() => navigate(metric.path)}
                  className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${metric.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {metric.label}
                    </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>vs last period</span>
                    <span className={`font-semibold ${trendColor}`}>
                      {metric.change}
                    </span>
                  </div>
                </button>
            );
          })}
        </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Quick actions
            </h2>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Frequently used admin tools
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => navigate('/users')}
              className="group flex h-full w-full flex-col justify-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-xs transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
            >
              <Users className="mb-1.5 h-4 w-4 text-blue-600 dark:text-blue-300" />
              <p className="font-semibold text-blue-700 dark:text-blue-200">
                Manage users
              </p>
              <p className="text-[11px] text-blue-500/80 dark:text-blue-300/80">
                View & edit accounts
                  </p>
                </button>
                <button
                  onClick={() => navigate('/admin/access')}
              className="group flex h-full w-full flex-col justify-center rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-xs transition hover:border-indigo-200 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
            >
              <Shield className="mb-1.5 h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <p className="font-semibold text-indigo-700 dark:text-indigo-200">
                Access control
              </p>
              <p className="text-[11px] text-indigo-500/80 dark:text-indigo-300/80">
                    Manage roles & permissions
                  </p>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
              className="group flex h-full w-full flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-xs transition hover:border-emerald-200 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
                >
              <TrendingUp className="mb-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                    Analytics
                  </p>
              <p className="text-[11px] text-emerald-500/80 dark:text-emerald-300/80">
                Review system reports
                  </p>
                </button>
                <button
                  onClick={() => navigate('/settings')}
              className="group flex h-full w-full flex-col justify-center rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-left text-xs transition hover:border-orange-200 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20"
            >
              <Settings className="mb-1.5 h-4 w-4 text-orange-500 dark:text-orange-300" />
              <p className="font-semibold text-orange-600 dark:text-orange-200">
                    System settings
                  </p>
              <p className="text-[11px] text-orange-500/80 dark:text-orange-300/80">
                Configure platform
              </p>
                </button>
              </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="min-w-0 rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">User growth</CardTitle>
                <CardDescription className="text-xs">
                  Adoption and role expansion over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="w-full overflow-x-auto">
                <ChartContainer
                  config={chartConfig}
                    className="h-[200px] min-w-[280px]"
                  >
                    <LineChart data={userGrowthData}>
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="min-w-0 rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Role distribution</CardTitle>
                <CardDescription className="text-xs">
                  Current user mix across teams
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="w-full overflow-x-auto">
                <ChartContainer
                  config={chartConfig}
                    className="h-[200px] min-w-[280px]"
                >
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                        label={(props: PieLabelRenderProps) => {
                          const rawPercent = props.percent;
                          const percentValue =
                            typeof rawPercent === 'number'
                              ? rawPercent
                              : Number(rawPercent ?? 0);
                          return `${Math.round(percentValue * 100)}%`;
                        }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistributionData.map((entry, index) => (
                          <Cell key={`role-${index}`} fill={entry.color} />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Card className="min-w-0 rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Access activity</CardTitle>
                <CardDescription className="text-xs">
                  Daily logins and permission requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="w-full overflow-x-auto">
                <ChartContainer
                  config={chartConfig}
                    className="h-[200px] min-w-[280px]"
                  >
                    <BarChart data={accessActivityData}>
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
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0 rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">User management</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/users')}
                  className="h-7 px-2 text-xs"
                  >
                  View all
                  </Button>
                </div>
              </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2 text-xs">
                  <button
                    onClick={() => navigate('/users')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Manage users
                        </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          View and edit user accounts
                        </p>
                    </div>
                    <UserCog className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/admin/access')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Access control
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">
                        Manage roles and permissions
                      </p>
                    </div>
                    <Shield className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base">Recruitment pipeline</CardTitle>
            <CardDescription className="text-xs">
              System-wide candidate distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.label}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div
                    className={`flex h-8 w-full items-center justify-center rounded-lg bg-gradient-to-r ${stage.gradient} text-xs font-semibold text-white shadow`}
                  >
                    {stage.count}
                  </div>
                  <p className="mt-2 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                    {stage.label}
                  </p>
                  <div className="mt-1 h-1.5 w-full rounded bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-1.5 rounded bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${Math.min(100, stage.count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Upcoming reviews</CardTitle>
                <CardDescription className="text-xs">
                  Scheduled admin tasks for this week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    {
                      name: 'Access audit',
                      role: 'Quarterly review',
                      time: 'Jan 28 • 10:00 AM',
                      status: 'Scheduled',
                    },
                    {
                      name: 'Role policy sync',
                      role: 'TA Leadership',
                      time: 'Jan 29 • 2:00 PM',
                      status: 'In prep',
                    },
                    {
                      name: 'Security posture',
                      role: 'InfoSec',
                      time: 'Jan 30 • 11:30 AM',
                      status: 'Pending docs',
                    },
                  ].map(({ name, role, time, status }, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {name}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          {role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-700 dark:text-gray-200">
                          {time}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>

          <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription className="text-xs">
                Latest admin actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2 text-xs">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {activity.action}
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      {activity.resource}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
