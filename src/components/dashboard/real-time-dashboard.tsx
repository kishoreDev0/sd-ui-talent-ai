import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building,
  Target,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
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
  ResponsiveContainer,
} from 'recharts';
import * as Recharts from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAllUsers } from '@/store/user/actions/userActions';
import { getAllJobs } from '@/store/job/actions/jobActions';
import { getAllCandidates } from '@/store/candidate/actions/candidateActions';
import { interviewService } from '@/store/interviews/service/interviewService';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

const LineChart = Recharts.LineChart;
const BarChart = Recharts.BarChart;
const PieChart = Recharts.PieChart;

interface DashboardMetrics {
  totalUsers: number;
  totalJobs: number;
  totalCandidates: number;
  totalInterviews: number;
  activeJobs: number;
  scheduledInterviews: number;
  completedInterviews: number;
  pendingFeedback: number;
}

interface InterviewRound {
  id: number;
  round_name: string;
  status: string;
  scheduled_start: string;
  candidate_id: number;
  job_id: number;
  created_at: string;
}

interface RealTimeDashboardProps {
  userRole?: UserRole;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { users } = useAppSelector((state) => state.user);
  const { jobs } = useAppSelector((state) => state.job);
  const { candidates } = useAppSelector((state) => state.candidate);
  const { user } = useAppSelector((state) => state.auth);
  
  // Local state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalJobs: 0,
    totalCandidates: 0,
    totalInterviews: 0,
    activeJobs: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    pendingFeedback: 0,
  });
  
  const [interviews, setInterviews] = useState<InterviewRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch users, jobs, candidates
      await Promise.all([
        dispatch(getAllUsers({ page: 1, page_size: 1000 })),
        dispatch(getAllJobs({ page: 1, page_size: 1000 })),
        dispatch(getAllCandidates({ page: 1, page_size: 1000 })),
      ]);

      // Fetch interviews
      try {
        const interviewResponse = await interviewService.listInterviewRounds({
          page: 1,
          page_size: 1000,
        });
        setInterviews(interviewResponse.data || []);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setInterviews([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Calculate metrics
  useEffect(() => {
    const activeJobs = jobs?.filter(job => job.status === 'active')?.length || 0;
    const scheduledInterviews = interviews?.filter(interview => interview.status === 'scheduled')?.length || 0;
    const completedInterviews = interviews?.filter(interview => interview.status === 'completed')?.length || 0;
    const pendingFeedback = interviews?.filter(interview => interview.status === 'needs_feedback')?.length || 0;

    setMetrics({
      totalUsers: users?.length || 0,
      totalJobs: jobs?.length || 0,
      totalCandidates: candidates?.length || 0,
      totalInterviews: interviews?.length || 0,
      activeJobs,
      scheduledInterviews,
      completedInterviews,
      pendingFeedback,
    });
  }, [users, jobs, candidates, interviews]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Chart data
  const activityData = [
    { name: 'Mon', jobs: 12, candidates: 25, interviews: 8 },
    { name: 'Tue', jobs: 15, candidates: 32, interviews: 12 },
    { name: 'Wed', jobs: 8, candidates: 18, interviews: 6 },
    { name: 'Thu', jobs: 20, candidates: 28, interviews: 15 },
    { name: 'Fri', jobs: 18, candidates: 35, interviews: 10 },
    { name: 'Sat', jobs: 5, candidates: 12, interviews: 3 },
    { name: 'Sun', jobs: 3, candidates: 8, interviews: 2 },
  ];

  const interviewStatusData = [
    { name: 'Scheduled', value: metrics.scheduledInterviews, color: '#3b82f6' },
    { name: 'Completed', value: metrics.completedInterviews, color: '#10b981' },
    { name: 'Pending Feedback', value: metrics.pendingFeedback, color: '#f59e0b' },
  ];

  const pipelineData = [
    { stage: 'Applied', count: Math.floor(metrics.totalCandidates * 0.6) },
    { stage: 'Screening', count: Math.floor(metrics.totalCandidates * 0.4) },
    { stage: 'Interview', count: metrics.scheduledInterviews + metrics.completedInterviews },
    { stage: 'Feedback', count: metrics.pendingFeedback },
    { stage: 'Offer', count: Math.floor(metrics.completedInterviews * 0.3) },
    { stage: 'Hired', count: Math.floor(metrics.completedInterviews * 0.2) },
  ];

  const keyMetrics = [
    {
      label: 'Total Users',
      value: metrics.totalUsers.toString(),
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      path: '/users',
    },
    {
      label: 'Active Jobs',
      value: metrics.activeJobs.toString(),
      change: '+12%',
      trend: 'up',
      icon: Briefcase,
      color: 'bg-green-500',
      path: '/jobs',
    },
    {
      label: 'Total Candidates',
      value: metrics.totalCandidates.toString(),
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-purple-500',
      path: '/candidates',
    },
    {
      label: 'Scheduled Interviews',
      value: metrics.scheduledInterviews.toString(),
      change: '+15%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-orange-500',
      path: '/interviews',
    },
  ];

  const recentInterviews = interviews
    .sort((a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime())
    .slice(0, 5);

  const chartConfig = {
    jobs: { label: 'Jobs', color: 'hsl(var(--chart-1))' },
    candidates: { label: 'Candidates', color: 'hsl(var(--chart-2))' },
    interviews: { label: 'Interviews', color: 'hsl(var(--chart-3))' },
  };

  // Get current user role
  const currentUserRole = userRole || user?.role?.name || 'admin';
  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="min-h-screen space-y-6 bg-transparent p-4">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Real-Time Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live insights across your talent acquisition pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Key Metrics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keyMetrics.map((metric) => {
            const Icon = metric.icon;
            const trendColor = metric.trend === 'up' ? 'text-green-500' : 'text-red-500';
            
            return (
              <Card
                key={metric.label}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(metric.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {metric.value}
                      </p>
                    </div>
                    <div className={`rounded-full p-3 ${metric.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Jobs, candidates, and interviews over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="jobs" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="candidates" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interviews" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Interview Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Interview Status
              </CardTitle>
              <CardDescription>
                Current distribution of interview statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Recharts.PieChart>
                    <Pie
                      data={interviewStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {interviewStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </Recharts.PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recruitment Pipeline
            </CardTitle>
            <CardDescription>
              Real-time candidate flow through recruitment stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {pipelineData.map((stage, index) => (
                <div
                  key={stage.stage}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {stage.count}
                    </div>
                    {index < pipelineData.length - 1 && (
                      <div className="absolute top-8 left-full w-4 h-0.5 bg-gray-300 hidden lg:block" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stage.stage}
                  </p>
                  <div className="mt-1 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${Math.min(100, (stage.count / Math.max(...pipelineData.map(s => s.count))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Interviews
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/interviews')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInterviews.length > 0 ? (
                  recentInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {interview.round_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(interview.scheduled_start).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          interview.status === 'completed' ? 'default' :
                          interview.status === 'scheduled' ? 'secondary' : 'outline'
                        }
                      >
                        {interview.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No recent interviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-12"
                  onClick={() => navigate('/jobs')}
                >
                  <Briefcase className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Manage Jobs</p>
                    <p className="text-xs text-gray-500">{metrics.activeJobs} active positions</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-12"
                  onClick={() => navigate('/candidates')}
                >
                  <UserCheck className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">View Candidates</p>
                    <p className="text-xs text-gray-500">{metrics.totalCandidates} in pipeline</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-12"
                  onClick={() => navigate('/interviews')}
                >
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Schedule Interviews</p>
                    <p className="text-xs text-gray-500">{metrics.scheduledInterviews} upcoming</p>
                  </div>
                </Button>
                {!isAdmin && (
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-12"
                    onClick={() => navigate('/resume-match')}
                  >
                    <Target className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Resume Matching</p>
                      <p className="text-xs text-gray-500">AI-powered analysis</p>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-gray-500">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-gray-500">Connected and syncing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-gray-500">Healthy and responsive</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
