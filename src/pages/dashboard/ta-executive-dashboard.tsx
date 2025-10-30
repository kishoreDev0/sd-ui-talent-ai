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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 shadow-xl mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                TA Executive Dashboard
              </h1>
              <p className="text-blue-100">
                Full create/edit permissions • Job Management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/register-job')}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/candidates/register')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => {
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/register-job')}
              className="group p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <Briefcase className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Create Job</p>
              <p className="text-purple-100 text-xs">Post new position</p>
            </button>
            <button
              onClick={() => navigate('/candidates/register')}
              className="group p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <Users className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Add Candidate</p>
              <p className="text-blue-100 text-xs">Register new candidate</p>
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="group p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <FileText className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Job Board</p>
              <p className="text-green-100 text-xs">View all jobs</p>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="group p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <BarChart3 className="h-6 w-6 text-white mb-2" />
              <p className="text-white font-semibold">Analytics</p>
              <p className="text-orange-100 text-xs">View reports</p>
            </button>
          </div>
        </motion.div>

        {/* Job Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Job Management
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/jobs')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/register-job')}
                className="w-full p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all border border-white/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Create New Job
                    </p>
                    <p className="text-sm text-gray-600">
                      Post a new job opening
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
              </button>
              <button
                onClick={() => navigate('/organizations')}
                className="w-full p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all border border-white/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Manage Organizations
                    </p>
                    <p className="text-sm text-gray-600">
                      Add or edit organizations
                    </p>
                  </div>
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/30"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-white/50 rounded-xl border border-white/30"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.resource}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pipeline Overview (Kanban-lite) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-white/10"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Recruitment Pipeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: 'Applied', count: 120, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Screening', count: 45, gradient: 'from-yellow-500 to-orange-500' },
              { label: 'Interview Scheduled', count: 18, gradient: 'from-purple-500 to-pink-500' },
              { label: 'Feedback Pending', count: 12, gradient: 'from-indigo-500 to-purple-600' },
              { label: 'Offer Sent', count: 8, gradient: 'from-green-500 to-emerald-500' },
              { label: 'Hired / Rejected', count: 30, gradient: 'from-slate-500 to-gray-600' },
            ].map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-4 rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-slate-900/40"
              >
                <div className={`w-full h-10 rounded-xl bg-gradient-to-r ${stage.gradient} text-white flex items-center justify-center font-semibold shadow`}>{stage.count}</div>
                <p className="mt-3 text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">{stage.label}</p>
                <div className="mt-2 h-2 w-full bg-gray-200/70 dark:bg-white/10 rounded">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded" style={{ width: `${Math.min(100, stage.count)}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Performance & Hiring Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="xl:col-span-2 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Team Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="py-2 pr-4">Recruiter</th>
                    <th className="py-2 pr-4">Candidates</th>
                    <th className="py-2 pr-4">Interviews</th>
                    <th className="py-2 pr-4">Pending Feedbacks</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {[['Anita',56,14,3],['Rahul',42,11,5],['Meera',37,9,2],['Vikram',29,7,1]].map((r) => (
                    <tr key={r[0]} className="border-t border-white/30 dark:border-white/10">
                      <td className="py-3 pr-4 font-medium">{r[0]}</td>
                      <td className="py-3 pr-4">{r[1]}</td>
                      <td className="py-3 pr-4">{r[2]}</td>
                      <td className="py-3 pr-4">{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Hiring Analytics (placeholders) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Hiring Analytics</h2>
            <div className="space-y-4">
              {/* Line chart placeholder */}
              <div className="h-24 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/40 dark:border-white/10" />
              {/* Pie chart placeholder */}
              <div className="h-24 rounded-xl bg-gradient-to-r from-emerald-500/30 to-green-500/30 border border-white/40 dark:border-white/10" />
              {/* Bar chart placeholder */}
              <div className="h-24 rounded-xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-white/40 dark:border-white/10" />
            </div>
          </motion.div>
        </div>

        {/* Upcoming Interviews & Feedback Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="xl:col-span-2 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Upcoming Interviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[{name:'Emily Davis',role:'UI/UX Designer',time:'Jan 28 • 10:00 AM',status:'Scheduled'},{name:'David Park',role:'Backend Engineer',time:'Jan 29 • 2:00 PM',status:'Scheduled'},{name:'Sarah Johnson',role:'Product Designer',time:'Jan 30 • 11:30 AM',status:'Pending Feedback'}].map((i,idx)=> (
                <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-white/30 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{i.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{i.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{i.time}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">{i.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feedback & Pending Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Feedback & Pending Actions</h2>
            <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
              <li className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/30 dark:border-white/10">3 feedbacks pending for UI/UX Designer role</li>
              <li className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/30 dark:border-white/10">Follow up with 2 candidates for take-home assignment</li>
              <li className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/30 dark:border-white/10">Schedule panel interview for Backend Engineer</li>
            </ul>
          </motion.div>
        </div>

        {/* Job Positions & Smart Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* Job Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="xl:col-span-2 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Job Positions</h2>
              <Button onClick={() => navigate('/register-job')} className="bg-indigo-600 hover:bg-indigo-700 text-white">Add New Job</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">Recruiter</th>
                    <th className="py-2 pr-4">Days Open</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {[{t:'Frontend Developer',d:'Engineering',r:'Anita',days:12},{t:'Backend Engineer',d:'Engineering',r:'Vikram',days:21},{t:'QA Analyst',d:'Quality',r:'Meera',days:7}].map((j)=> (
                    <tr key={j.t} className="border-t border-white/30 dark:border-white/10">
                      <td className="py-3 pr-4 font-medium">{j.t}</td>
                      <td className="py-3 pr-4">{j.d}</td>
                      <td className="py-3 pr-4">{j.r}</td>
                      <td className="py-3 pr-4">{j.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Smart Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 shadow-2xl border border-white/30 dark:border-white/10"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Smart Insights</h2>
            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 to-green-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">5 candidates match the new Node.js role.</div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300">Average feedback delay increased by 12% this week.</div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/20 text-orange-700 dark:text-orange-300">High drop-off at screening — review JD clarity.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TAExecutiveDashboard;
