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
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Metrics Grid */}
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${metric.color} p-2 rounded-lg shadow-md`}>
                        <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span
                        className={`text-xs font-semibold ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                  {metric.value}
                </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-3"
        >
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/register-job')}
                  className="group p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <Briefcase className="h-4 w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-xs">Create Job</p>
                  <p className="text-purple-100 text-[10px]">Post new position</p>
            </button>
            <button
              onClick={() => navigate('/candidates/register')}
                  className="group p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <Users className="h-4 w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-xs">Add Candidate</p>
                  <p className="text-blue-100 text-[10px]">Register new candidate</p>
            </button>
            <button
              onClick={() => navigate('/jobs')}
                  className="group p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <FileText className="h-4 w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-xs">Job Board</p>
                  <p className="text-green-100 text-[10px]">View all jobs</p>
            </button>
            <button
              onClick={() => navigate('/analytics')}
                  className="group p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <BarChart3 className="h-4 w-4 text-white mb-1" />
                  <p className="text-white font-semibold text-xs">Analytics</p>
                  <p className="text-orange-100 text-[10px]">View reports</p>
            </button>
          </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-3">
          {/* Hiring Trends Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-2"
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Monthly Hiring Trends</CardTitle>
                <CardDescription className="text-xs">Hired vs Offers over time</CardDescription>
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
          </motion.div>

          {/* Source Effectiveness Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Source Effectiveness</CardTitle>
                <CardDescription className="text-xs">Candidate sources breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <PieChart>
                    <Pie
                      data={sourceEffectivenessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
                      formatter={(value) => <span style={{ fontSize: '10px' }}>{value}</span>}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Time to Fill & Pipeline Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
          {/* Time to Fill Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Average Time to Fill by Role</CardTitle>
                <CardDescription className="text-xs">Days from posting to hire</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <BarChart data={timeToFillData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="days" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pipeline Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
                <CardDescription className="text-xs">Candidates at each stage</CardDescription>
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
          </motion.div>
        </div>

        {/* Team Performance & Job Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Team Performance</CardTitle>
                <CardDescription className="text-xs">Recruiter statistics</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ChartContainer config={chartConfig} className="h-[180px]">
                  <BarChart data={teamPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="candidates" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="interviews" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="feedbacks" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Management Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card>
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
          </motion.div>
        </div>

        {/* Pipeline Overview (Kanban-lite) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-3"
        >
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
              <CardDescription className="text-xs">Candidates by stage</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
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
                    gradient: 'from-purple-500 to-pink-500',
                  },
                  {
                    label: 'Feedback Pending',
                    count: 12,
                    gradient: 'from-indigo-500 to-purple-600',
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
                ].map((stage, i) => (
                  <motion.div
                key={stage.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              >
                <div
                      className={`w-full h-8 rounded-lg bg-gradient-to-r ${stage.gradient} text-white flex items-center justify-center font-semibold text-xs shadow`}
                >
                  {stage.count}
                </div>
                    <p className="mt-2 text-[10px] font-semibold text-gray-700 dark:text-gray-200 text-center">
                  {stage.label}
                </p>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded">
                      <div
                        className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded"
                        style={{ width: `${Math.min(100, stage.count)}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Upcoming Interviews */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="xl:col-span-2"
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Upcoming Interviews</CardTitle>
                <CardDescription className="text-xs">Scheduled interviews for this week</CardDescription>
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
                  ].map((i, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          {i.name}
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">
                          {i.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-700 dark:text-gray-200">
                          {i.time}
                        </p>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                          {i.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest actions and updates</CardDescription>
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
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TAExecutiveDashboard;
