import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  UserPlus,
  Target,
  BarChart3,
  Filter,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CandidateTracking {
  id: number;
  name: string;
  email: string;
  sourcedDate: string;
  status: 'Sourced' | 'Screening' | 'Interview' | 'Selected' | 'Rejected';
  source: string;
  jobTitle: string;
  selectionStage: string;
  daysInPipeline: number;
  matchScore: number;
}

const CandidateTrackingPage: React.FC = () => {
  const role = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateTracking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mock data - candidates brought in by TA Manager
  const [candidates] = useState<CandidateTracking[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      sourcedDate: '2024-10-15',
      status: 'Selected',
      source: 'LinkedIn',
      jobTitle: 'Product Designer',
      selectionStage: 'Final Selection',
      daysInPipeline: 18,
      matchScore: 92,
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      sourcedDate: '2024-10-18',
      status: 'Interview',
      source: 'Naukri',
      jobTitle: 'Frontend Developer',
      selectionStage: 'Technical Round',
      daysInPipeline: 15,
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      sourcedDate: '2024-10-20',
      status: 'Screening',
      source: 'Referral',
      jobTitle: 'UI/UX Designer',
      selectionStage: 'Resume Screening',
      daysInPipeline: 12,
      matchScore: 85,
    },
    {
      id: 4,
      name: 'David Park',
      email: 'david.park@email.com',
      sourcedDate: '2024-10-12',
      status: 'Selected',
      source: 'Indeed',
      jobTitle: 'Engineering Manager',
      selectionStage: 'Offer Extended',
      daysInPipeline: 20,
      matchScore: 95,
    },
    {
      id: 5,
      name: 'Jessica Brown',
      email: 'jessica.brown@email.com',
      sourcedDate: '2024-10-22',
      status: 'Rejected',
      source: 'LinkedIn',
      jobTitle: 'Backend Developer',
      selectionStage: 'Rejected in Screening',
      daysInPipeline: 5,
      matchScore: 65,
    },
    {
      id: 6,
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      sourcedDate: '2024-10-19',
      status: 'Interview',
      source: 'Company Website',
      jobTitle: 'Full Stack Developer',
      selectionStage: 'HR Round',
      daysInPipeline: 13,
      matchScore: 90,
    },
  ]);

  // Calculate metrics
  const totalSourced = candidates.length;
  const selected = candidates.filter((c) => c.status === 'Selected').length;
  const inPipeline = candidates.filter(
    (c) => c.status !== 'Selected' && c.status !== 'Rejected',
  ).length;
  const rejected = candidates.filter((c) => c.status === 'Rejected').length;
  const selectionRate = ((selected / totalSourced) * 100).toFixed(1);
  const avgDaysInPipeline = Math.round(
    candidates.reduce((sum, c) => sum + c.daysInPipeline, 0) / totalSourced,
  );

  // Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (candidate: CandidateTracking) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'Interview':
        return 'bg-primary-100 text-[#4F39F6] dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800';
      case 'Screening':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const statusOptions = [
    'All',
    'Sourced',
    'Screening',
    'Interview',
    'Selected',
    'Rejected',
  ];

  return (
    <MainLayout role={role}>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="px-2 py-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Candidate Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track candidates you've sourced and their selection progress
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total Sourced
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalSourced}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Selected
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selected}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {selectionRate}% rate
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  In Pipeline
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {inPipeline}
                </p>
                <p className="text-xs text-[#4F39F6] dark:text-primary-400 mt-1">
                  Active
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#4F39F6] dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Avg. Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {avgDaysInPipeline}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  days
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Selection Funnel */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 px-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Selection Funnel
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Sourced', count: totalSourced, color: 'bg-blue-500' },
              {
                label: 'Screening',
                count: candidates.filter((c) => c.status === 'Screening')
                  .length,
                color: 'bg-yellow-500',
              },
              {
                label: 'Interview',
                count: candidates.filter((c) => c.status === 'Interview')
                  .length,
                color: 'bg-[#4F39F6]',
              },
              {
                label: 'Selected',
                count: selected,
                color: 'bg-green-500',
              },
              {
                label: 'Rejected',
                count: rejected,
                color: 'bg-red-500',
              },
            ].map((stage, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`${stage.color} w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}
                >
                  {stage.count}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {stage.label}
                </p>
                {idx > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {(() => {
                      const prevStage =
                        idx === 1
                          ? totalSourced
                          : idx === 2
                            ? candidates.filter((c) => c.status === 'Screening')
                                .length
                            : idx === 3
                              ? candidates.filter(
                                  (c) => c.status === 'Interview',
                                ).length
                              : candidates.filter(
                                  (c) => c.status === 'Interview',
                                ).length;
                      return prevStage > 0
                        ? ((stage.count / prevStage) * 100).toFixed(0)
                        : '0';
                    })()}
                    %
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 px-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#4F39F6] text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Selection Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      colSpan={8}
                    >
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {candidate.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {candidate.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {candidate.jobTitle}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {candidate.source}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}
                        >
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {candidate.selectionStage}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {candidate.daysInPipeline} days
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${
                                candidate.matchScore >= 90
                                  ? 'bg-green-500'
                                  : candidate.matchScore >= 80
                                    ? 'bg-blue-500'
                                    : candidate.matchScore >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                              }`}
                              style={{ width: `${candidate.matchScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {candidate.matchScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(candidate)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate Tracking Details</DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.jobTitle}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Source
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.source}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sourced Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {new Date(
                        selectedCandidate.sourcedDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCandidate.status)}`}
                      >
                        {selectedCandidate.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selection Stage
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.selectionStage}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Days in Pipeline
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.daysInPipeline} days
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Match Score
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {selectedCandidate.matchScore}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CandidateTrackingPage;
