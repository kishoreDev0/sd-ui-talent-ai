import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
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
import { useAppSelector } from '@/store';

const LineChart = Recharts.LineChart;
const BarChart = Recharts.BarChart;
const PieChart = Recharts.PieChart;

const TAManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const storedUser = useMemo(() => {
    const persisted = localStorage.getItem('user');
    if (!persisted) {
      return null;
    }
    try {
      return JSON.parse(persisted);
    } catch {
      return null;
    }
  }, []);

  const activeUser = user ?? storedUser;

  const displayName = useMemo(() => {
    if (!activeUser) {
      return 'TA Manager';
    }

    if (activeUser.first_name || activeUser.last_name) {
      const composed = `${activeUser.first_name ?? ''} ${
        activeUser.last_name ?? ''
      }`.trim();
      if (composed.length > 0) {
        return composed;
      }
    }

    return (
      activeUser.username ??
      activeUser.userName ??
      activeUser.name ??
      activeUser.email ??
      'TA Manager'
    );
  }, [activeUser]);

  const keyIndicators = [
    {
      label: 'Active Candidates',
      value: '312',
      change: '+24',
      trend: 'up',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/candidates',
    },
    {
      label: 'Avg Time to Fill',
      value: '14 days',
      change: '-2 days',
      trend: 'down',
      icon: Clock,
      color: 'bg-emerald-500',
      path: '/analytics',
    },
    {
      label: 'Interview Pipeline',
      value: '42',
      change: '+5',
      trend: 'up',
      icon: CalendarDays,
      color: 'bg-blue-500',
      path: '/interviews',
    },
    {
      label: 'Offer Acceptance',
      value: '92%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'bg-orange-500',
      path: '/analytics',
    },
  ] as const;

  const quickActionLinks = [
    {
      title: 'Review pipelines',
      description: 'Track candidate progress',
      icon: TrendingUp,
      color: 'indigo',
      path: '/job-management',
    },
    {
      title: 'Schedule interviews',
      description: 'Coordinate panels & slots',
      icon: CalendarDays,
      color: 'blue',
      path: '/interviews',
    },
    {
      title: 'Sync with recruiters',
      description: 'Share feedback quickly',
      icon: MessageSquare,
      color: 'emerald',
      path: '/messages',
    },
    {
      title: 'Download reports',
      description: 'Share weekly summaries',
      icon: FileText,
      color: 'orange',
      path: '/analytics',
    },
  ] as const;

  const teamVelocityData = [
    { month: 'Jun', sourced: 120, interviews: 48 },
    { month: 'Jul', sourced: 138, interviews: 52 },
    { month: 'Aug', sourced: 142, interviews: 55 },
    { month: 'Sep', sourced: 156, interviews: 61 },
    { month: 'Oct', sourced: 162, interviews: 64 },
    { month: 'Nov', sourced: 174, interviews: 68 },
  ];

  const stageDistributionData = [
    { name: 'Sourced', value: 312, color: '#6366f1' },
    { name: 'Screening', value: 89, color: '#22c55e' },
    { name: 'Interviewing', value: 42, color: '#f97316' },
    { name: 'Offers', value: 12, color: '#c084fc' },
  ];

  const recruiterProductivity = [
    { name: 'Sarah', submissions: 28, interviews: 11 },
    { name: 'Mike', submissions: 24, interviews: 9 },
    { name: 'David', submissions: 21, interviews: 8 },
    { name: 'Emily', submissions: 18, interviews: 7 },
    { name: 'Aisha', submissions: 16, interviews: 6 },
  ];

  const chartConfig = {
    sourced: {
      label: 'Sourced',
      color: 'hsl(var(--chart-1))',
    },
    interviews: {
      label: 'Interviews',
      color: 'hsl(var(--chart-2))',
    },
  };

  const pipelineStages = [
    {
      label: 'Sourced',
      count: 312,
      gradient: 'from-indigo-500 to-indigo-400',
    },
    {
      label: 'Screening',
      count: 89,
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Interviewing',
      count: 42,
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      label: 'Offer Extended',
      count: 12,
      gradient: 'from-orange-500 to-amber-400',
    },
    {
      label: 'Offer Accepted',
      count: 9,
      gradient: 'from-purple-500 to-fuchsia-400',
    },
    {
      label: 'Onboarding',
      count: 6,
      gradient: 'from-slate-500 to-slate-400',
    },
  ] as const;

  const upcomingEvents = [
    {
      candidate: 'David Park',
      role: 'Systems Engineer',
      time: 'Nov 12 • 10:30 AM',
      status: 'Panel interview',
    },
    {
      candidate: 'Emily Davis',
      role: 'Product Designer',
      time: 'Nov 13 • 2:00 PM',
      status: 'Portfolio review',
    },
    {
      candidate: 'Michael Chen',
      role: 'Frontend Developer',
      time: 'Nov 14 • 11:00 AM',
      status: 'Final round',
    },
    {
      candidate: 'Sarah Johnson',
      role: 'UX Researcher',
      time: 'Nov 15 • 4:30 PM',
      status: 'Offer sync',
    },
  ];

  const teamActivity = [
    {
      member: 'Sarah Wilson',
      action: 'Sourced 12 candidates for Design Lead position',
      time: '2 hours ago',
    },
    {
      member: 'Mike Johnson',
      action: 'Completed 3 technical interviews for Frontend role',
      time: '4 hours ago',
    },
    {
      member: 'David Brown',
      action: 'Scheduled 5 interviews for QA Specialist',
      time: '6 hours ago',
    },
    {
      member: 'Emily Davis',
      action: 'Posted 2 new roles for Sales & Marketing',
      time: '1 day ago',
    },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-transparent p-3 sm:p-5 lg:p-2">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              TA Manager Command Center
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Welcome back, {displayName}. Track recruiter performance, pipeline
              velocity, and candidate progress in one place.
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
              onClick={() => navigate('/team')}
            >
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Team overview
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
            {keyIndicators.map((metric) => {
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
                    <span>vs last cycle</span>
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
              Daily workflow shortcuts
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {quickActionLinks.map((action) => {
              const Icon = action.icon;
              const borderColor =
                action.color === 'indigo'
                  ? 'border-indigo-100 bg-indigo-50 hover:border-indigo-200 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20'
                  : action.color === 'blue'
                    ? 'border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:bg-blue-500/20'
                    : action.color === 'emerald'
                      ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-200 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20'
                      : 'border-orange-100 bg-orange-50 hover:border-orange-200 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20';
              const iconColor =
                action.color === 'indigo'
                  ? 'text-indigo-600 dark:text-indigo-300'
                  : action.color === 'blue'
                    ? 'text-blue-600 dark:text-blue-300'
                    : action.color === 'emerald'
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-orange-500 dark:text-orange-300';

              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className={`group flex h-full w-full flex-col justify-center rounded-2xl border px-4 py-3 text-left text-xs transition ${borderColor}`}
                >
                  <Icon className={`mb-1.5 h-4 w-4 ${iconColor}`} />
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {action.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-300">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card className="min-w-0 rounded-3xl border border-gray-200 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Team velocity</CardTitle>
                <CardDescription className="text-xs">
                  Sourced candidates vs interviews completed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="w-full overflow-x-auto">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] min-w-[280px]"
                  >
                    <LineChart data={teamVelocityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sourced"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-1))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interviews"
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
                <CardTitle className="text-base">Stage distribution</CardTitle>
                <CardDescription className="text-xs">
                  Where candidates sit today
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
                        data={stageDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: PieLabelRenderProps) => {
                          const percentValue =
                            typeof props.percent === 'number'
                              ? props.percent
                              : Number(props.percent ?? 0);
                          return `${Math.round(percentValue * 100)}%`;
                        }}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stageDistributionData.map((entry, index) => (
                          <Cell key={`stage-${index}`} fill={entry.color} />
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
                <CardTitle className="text-base">Recruiter throughput</CardTitle>
                <CardDescription className="text-xs">
                  Submissions vs interviews this week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="w-full overflow-x-auto">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] min-w-[280px]"
                  >
                    <BarChart data={recruiterProductivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="submissions"
                        fill="hsl(var(--chart-1))"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="interviews"
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
                <CardTitle className="text-base">Team operations</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => navigate('/team')}
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => navigate('/job-management')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Open requisitions
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">
                        Ensure coverage across roles
                      </p>
                    </div>
                    <BarChart3 className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/interviews')}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Interview coverage
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400">
                        Confirm panels & availability
                      </p>
                    </div>
                    <CalendarDays className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
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
              Candidate volume at each stage
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
                      className="h-1.5 rounded bg-gradient-to-r from-indigo-500 to-indigo-300"
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
                <CardTitle className="text-base">Upcoming interviews</CardTitle>
                <CardDescription className="text-xs">
                  Critical touchpoints for the week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid gap-2 md:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={`${event.candidate}-${event.time}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {event.candidate}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          {event.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-700 dark:text-gray-200">
                          {event.time}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                          {event.status}
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
                Latest updates from the recruiting team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2 text-xs">
                {teamActivity.map((activity) => (
                  <div
                    key={`${activity.member}-${activity.time}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {activity.member}
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      {activity.action}
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

export default TAManagerDashboard;
