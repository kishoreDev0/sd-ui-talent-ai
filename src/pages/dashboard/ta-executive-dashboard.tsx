import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import * as Recharts from 'recharts';

const LineChart = Recharts.LineChart;
const BarChart = Recharts.BarChart;
const PieChart = Recharts.PieChart;
const AreaChart = Recharts.AreaChart;

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
      color: 'bg-[#4F39F6]',
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

  // Chart data
  const hiringTrendsData = [
    { month: 'Jan', hired: 5, offers: 8 },
    { month: 'Feb', hired: 8, offers: 12 },
    { month: 'Mar', hired: 12, offers: 15 },
    { month: 'Apr', hired: 10, offers: 14 },
    { month: 'May', hired: 15, offers: 18 },
    { month: 'Jun', hired: 18, offers: 22 },
  ];

  const sourceEffectivenessData = [
    { name: 'LinkedIn', value: 45, color: '#3b82f6' },
    { name: 'Naukri', value: 25, color: '#10b981' },
    { name: 'Referrals', value: 15, color: '#f59e0b' },
    { name: 'Indeed', value: 10, color: '#ef4444' },
    { name: 'Others', value: 5, color: '#8b5cf6' },
  ];

  const timeToFillData = [
    { role: 'Frontend', days: 12 },
    { role: 'Backend', days: 18 },
    { role: 'Full Stack', days: 15 },
    { role: 'QA', days: 10 },
    { role: 'DevOps', days: 20 },
    { role: 'UI/UX', days: 14 },
  ];

  const pipelineData = [
    { stage: 'Applied', count: 120 },
    { stage: 'Screening', count: 45 },
    { stage: 'Interview', count: 18 },
    { stage: 'Offer', count: 8 },
    { stage: 'Hired', count: 5 },
  ];

  const teamPerformanceData = [
    { name: 'Anita', candidates: 56, interviews: 14, feedbacks: 3 },
    { name: 'Rahul', candidates: 42, interviews: 11, feedbacks: 5 },
    { name: 'Meera', candidates: 37, interviews: 9, feedbacks: 2 },
    { name: 'Vikram', candidates: 29, interviews: 7, feedbacks: 1 },
  ];

  const chartConfig = {
    hired: {
      label: 'Hired',
      color: 'hsl(var(--chart-1))',
    },
    offers: {
      label: 'Offers',
      color: 'hsl(var(--chart-2))',
    },
  };

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
    <div className="min-h-screen space-y-4 bg-transparent p-3 sm:p-5 lg:p-2">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Talent Acquisition Overview
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Track hiring velocity, pipeline health, and team performance in a
              single snapshot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-8 rounded-2xl border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={() => navigate('/analytics')}
            >
              View analytics
            </Button>
            <Button
              className="h-8 rounded-2xl bg-purple-600 px-3 text-xs font-semibold text-white shadow hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              onClick={() => navigate('/register-job')}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New requisition
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
                <div
                  key={metric.label}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
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
                </div>
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
              Shortcut tools for daily workflows
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/register-job')}
              className="group flex h-full flex-col justify-center rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-xs transition hover:border-indigo-200 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
            >
              <Briefcase className="mb-1.5 h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <p className="font-semibold text-indigo-700 dark:text-indigo-200">
                Create job
              </p>
              <p className="text-[11px] text-indigo-500/80 dark:text-indigo-300/80">
                Post new position
              </p>
            </button>
            <button
              onClick={() => navigate('/candidates/register')}
              className="group flex h-full flex-col justify-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-xs transition hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
            >
              <Users className="mb-1.5 h-4 w-4 text-blue-600 dark:text-blue-300" />
              <p className="font-semibold text-blue-700 dark:text-blue-200">
                Add candidate
              </p>
              <p className="text-[11px] text-blue-500/80 dark:text-blue-300/80">
                Register new candidate
              </p>
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="group flex h-full flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-xs transition hover:border-emerald-200 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
            >
              <FileText className="mb-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                Job board
              </p>
              <p className="text-[11px] text-emerald-500/80 dark:text-emerald-300/80">
                View all roles
              </p>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="group flex h-full flex-col justify-center rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-left text-xs transition hover:border-orange-200 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20"
            >
              <BarChart3 className="mb-1.5 h-4 w-4 text-orange-500 dark:text-orange-300" />
              <p className="font-semibold text-orange-600 dark:text-orange-200">
                Analytics
              </p>
              <p className="text-[11px] text-orange-500/80 dark:text-orange-300/80">
                Review reports
              </p>
            </button>
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid gap-4 xl:grid-cols-3">
          {/* Hiring Trends Line Chart */}
          <div className="xl:col-span-2">
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">
                  Monthly Hiring Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  Hired vs Offers over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <LineChart data={hiringTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hired"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="offers"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Source Effectiveness Pie Chart */}
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">
                  Source Effectiveness
                </CardTitle>
                <CardDescription className="text-xs">
                  Candidate sources breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <PieChart>
                    <Pie
                      data={sourceEffectivenessData}
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
                      {sourceEffectivenessData.map((entry, index) => (
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
          </div>
        </div>

        {/* Time to Fill & Pipeline Charts */}
        <div className="grid gap-4 xl:grid-cols-2">
          {/* Time to Fill Bar Chart */}
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">
                  Average Time to Fill by Role
                </CardTitle>
                <CardDescription className="text-xs">
                  Days from posting to hire
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <BarChart data={timeToFillData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="days"
                      fill="hsl(var(--chart-1))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Area Chart */}
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">
                  Recruitment Pipeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Candidates at each stage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <AreaChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Performance & Job Management */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Team Performance</CardTitle>
                <CardDescription className="text-xs">
                  Recruiter statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[180px]">
                  <BarChart data={teamPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="candidates"
                      fill="hsl(var(--chart-1))"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="interviews"
                      fill="hsl(var(--chart-2))"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="feedbacks"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Job Management Section */}
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Job Management</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/jobs')}
                    className="h-7 px-2 text-xs"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/register-job')}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          Create New Job
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          Post a new job opening
                        </p>
                      </div>
                      <Plus className="h-3 w-3 text-gray-400" />
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/organizations')}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          Manage Organizations
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          Add or edit organizations
                        </p>
                      </div>
                      <Target className="h-3 w-3 text-gray-400" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pipeline Overview (Kanban-lite) */}
        <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
            <CardDescription className="text-xs">
              Candidates by stage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
              {[
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
              ].map((stage) => (
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

        {/* Recent Activity & Upcoming Interviews */}
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Upcoming Interviews</CardTitle>
                <CardDescription className="text-xs">
                  Scheduled interviews for this week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    {
                      name: 'Emily Davis',
                      role: 'UI/UX Designer',
                      time: 'Jan 28 • 10:00 AM',
                      status: 'Scheduled',
                    },
                    {
                      name: 'David Park',
                      role: 'Backend Engineer',
                      time: 'Jan 29 • 2:00 PM',
                      status: 'Scheduled',
                    },
                    {
                      name: 'Sarah Johnson',
                      role: 'Product Designer',
                      time: 'Jan 30 • 11:30 AM',
                      status: 'Pending Feedback',
                    },
                  ].map(({ name, role, time, status }, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          {name}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          {role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-700 dark:text-gray-200">
                          {time}
                        </p>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">
                  Latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TAExecutiveDashboard;
