import React, { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  Filter,
  MessageCircle,
  Plus,
  Search,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserRole } from '@/utils/getUserRole';

interface CandidateStage {
  id: number;
  step: number;
  title: string;
  icon: LucideIcon;
  rating: string;
  badge: string;
  badgeColor: string;
  status: string;
  description: string;
  gradient: string;
}

interface CandidateActivity {
  id: number;
  icon: LucideIcon;
  title: string;
  file?: string;
  comment?: string;
  timestamp: string;
}

interface CandidateBadge {
  label: string;
  tone: string;
}

interface CandidateListItem {
  id: number;
  name: string;
  role: string;
  statusLabel: string;
  statusTone: string;
  stageLabel: string;
  stageTone: string;
  avatarGradient: string;
  highlight?: boolean;
  email: string;
  assignedTo: string;
  timezone: string;
  statusNote: string;
  createdOn: string;
  createdBy: string;
}

interface CandidateDetail extends CandidateListItem {
  summary: string;
  location: string;
  rating: number;
  badges: CandidateBadge[];
  stages: CandidateStage[];
  activities: CandidateActivity[];
}

const candidatesData: CandidateDetail[] = [
    {
      id: 1,
    name: 'Courtney Henry',
    role: 'Product Designer',
    statusLabel: 'Needs Follow-up',
    statusTone: 'bg-amber-100 text-amber-700',
    stageLabel: 'Screening',
    stageTone: 'bg-sky-100 text-sky-600',
    avatarGradient: 'from-[#34d399] to-[#22d3ee]',
    email: 'courtney.henry@example.com',
    assignedTo: 'Vinodan T',
    timezone: 'Asia/Kolkata',
    statusNote: 'Scheduled Client Interview',
    createdOn: 'Feb 11, 2025',
    createdBy: 'Vinodan T',
    summary:
      'Initial portfolio review complete. Waiting on collaboration examples before moving to the design challenge.',
    location: 'Austin, USA',
    rating: 4.0,
    badges: [
      { label: 'UX Guild', tone: 'bg-emerald-100 text-emerald-700' },
      { label: 'Remote ready', tone: 'bg-sky-100 text-sky-600' },
    ],
    stages: [
      {
        id: 101,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '4.0',
        badge: 'Hire',
        badgeColor: 'bg-emerald-500 text-white',
        status: 'Completed',
        description: 'Design leadership reviewing key case studies.',
        gradient: 'from-emerald-50 to-teal-50',
      },
      {
        id: 102,
        step: 2,
        title: 'Technical Round',
        icon: ClipboardCheck,
        rating: '3.6',
        badge: 'Hire',
        badgeColor: 'bg-amber-500 text-white',
        status: 'In review',
        description: 'Awaiting candidate availability for live critique.',
        gradient: 'from-amber-50 to-orange-50',
      },
      {
        id: 103,
        step: 3,
        title: 'Pair-Programming',
        icon: Clock,
        rating: '0.00',
        badge: 'Waiting',
        badgeColor: 'bg-slate-400 text-white',
        status: 'Next step',
        description: 'Panel conversation planned post design challenge.',
        gradient: 'from-slate-50 to-gray-100',
      },
    ],
    activities: [
      {
        id: 201,
        icon: Calendar,
        title: 'Scheduling call with design lead',
        timestamp: 'Added at 08.11.25 • 15:10',
      },
      {
        id: 202,
        icon: MessageCircle,
        title: 'Shared new case study links',
        timestamp: 'Added at 08.11.25 • 12:42',
      },
    ],
    },
    {
      id: 2,
    name: 'Wade Warren',
    role: 'FrontEnd Developer',
    statusLabel: 'Awaiting',
    statusTone: 'bg-violet-50 text-violet-600',
    stageLabel: 'Pair-Programming',
    stageTone: 'bg-purple-50 text-purple-600',
    avatarGradient: 'from-[#6366f1] to-[#a855f7]',
    highlight: true,
    email: 'wade.warren@example.com',
    assignedTo: 'Srikant',
    timezone: 'Asia/Kolkata',
    statusNote: 'Scheduled Client Interview',
    createdOn: 'Jan 12, 2025',
    createdBy: 'Vinodan T',
    summary: 'Executive interview date (31.12.22) confirmed by Darrell Steward',
    location: 'San Francisco, USA',
    rating: 4.2,
    badges: [],
    stages: [
      {
        id: 111,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '4.2',
        badge: 'Hire',
        badgeColor: 'bg-emerald-500 text-white',
        status: 'Completed',
        description: 'Recruiter summary aligns with role expectations.',
        gradient: 'from-emerald-50 to-teal-50',
      },
      {
        id: 112,
        step: 2,
        title: 'Technical Round',
        icon: Star,
        rating: '3.89',
        badge: 'Hire',
        badgeColor: 'bg-amber-500 text-white',
        status: 'Wrapped up',
        description: 'Task showcased mastery of React and state orchestration.',
        gradient: 'from-amber-50 to-orange-50',
      },
      {
        id: 113,
        step: 3,
        title: 'Pair-Programming',
        icon: Clock,
        rating: '0.00',
        badge: 'Waiting',
        badgeColor: 'bg-slate-400 text-white',
        status: 'Next step',
        description: 'Live coding session scheduled with FE practice lead.',
        gradient: 'from-slate-50 to-gray-100',
      },
    ],
    activities: [
      {
        id: 211,
        icon: Calendar,
        title: 'Executive interview date confirmed by Darrell Steward',
        timestamp: 'Added at 12.01.23 • 14:28',
      },
      {
        id: 212,
        icon: FileText,
        title: 'Bill Murrey uploaded',
        file: 'cv.murrey.pdf',
        timestamp: 'Added at 12.01.23 • 14:28',
      },
      {
        id: 213,
        icon: MessageCircle,
        title: 'Joy Division wrote comment',
        comment:
          'Let’s provide the team with the highest quality participants tailored for their research needs. Recruit, book & pay quality research participants in a fraction of the time of agencies.',
        timestamp: 'Added at 12.01.23 • 14:28',
      },
    ],
    },
    {
      id: 3,
    name: 'Albert Flores',
    role: 'DevOps Engineer',
    statusLabel: 'Scheduled',
    statusTone: 'bg-sky-100 text-sky-700',
    stageLabel: 'Technical',
    stageTone: 'bg-blue-100 text-blue-600',
    avatarGradient: 'from-[#14b8a6] to-[#0ea5e9]',
    email: 'albert.flores@example.com',
    assignedTo: 'Ashok Anbarasu',
    timezone: 'UTC-5',
    statusNote: 'Yet to be assigned',
    createdOn: 'Apr 12, 2024',
    createdBy: 'Ashok Anbarasu',
    summary:
      'Technical session prepared. Needs deeper discussion on observability, resiliency playbooks and incident response workflows.',
    location: 'New York, USA',
    rating: 3.8,
    badges: [{ label: 'Cloud ready', tone: 'bg-sky-100 text-sky-600' }],
    stages: [
      {
        id: 121,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '3.8',
        badge: 'Shortlist',
        badgeColor: 'bg-teal-500 text-white',
        status: 'Completed',
        description: 'Recruiter notes highlight cultural alignment.',
        gradient: 'from-emerald-50 to-teal-50',
      },
      {
        id: 122,
        step: 2,
        title: 'Technical Round',
        icon: ClipboardCheck,
        rating: '—',
        badge: 'Scheduled',
        badgeColor: 'bg-sky-500 text-white',
        status: 'Tomorrow',
        description: 'Panel focusing on Kubernetes and SRE posture.',
        gradient: 'from-sky-50 to-cyan-50',
      },
      {
        id: 123,
        step: 3,
        title: 'Pair-Programming',
        icon: Clock,
        rating: '—',
        badge: 'Pending',
        badgeColor: 'bg-slate-400 text-white',
        status: 'Awaiting',
        description: 'Post technical sync with team manager and PM.',
        gradient: 'from-slate-50 to-gray-100',
      },
    ],
    activities: [
      {
        id: 221,
        icon: Calendar,
        title: 'Technical interview locked with platform team',
        timestamp: 'Added at 05.11.25 • 10:12',
      },
    ],
  },
  {
    id: 4,
    name: 'Kristin Watson',
    role: 'Product Manager',
    statusLabel: 'Passed',
    statusTone: 'bg-emerald-100 text-emerald-700',
    stageLabel: 'Offer',
    stageTone: 'bg-emerald-100 text-emerald-700',
    avatarGradient: 'from-[#22c55e] to-[#84cc16]',
    email: 'kristin.watson@example.com',
    assignedTo: 'Ashok Anbarasu',
    timezone: 'UTC-5',
    statusNote: 'Yet to be assigned',
    createdOn: 'Mar 02, 2025',
    createdBy: 'Ashok Anbarasu',
    summary:
      'Offer draft shared. Awaiting confirmation from leadership and finance stakeholders before release.',
    location: 'Remote • Canada',
    rating: 4.5,
    badges: [
      { label: 'Strategic thinker', tone: 'bg-lime-100 text-lime-700' },
      { label: 'Remote ready', tone: 'bg-sky-100 text-sky-600' },
    ],
    stages: [
      {
        id: 131,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '4.1',
        badge: 'Advance',
        badgeColor: 'bg-emerald-500 text-white',
        status: 'Completed',
        description: 'Kick-off call with hiring manager & design director.',
        gradient: 'from-emerald-50 to-teal-50',
      },
      {
        id: 132,
        step: 2,
        title: 'Technical Round',
        icon: Star,
        rating: '4.5',
        badge: 'Hire',
        badgeColor: 'bg-amber-500 text-white',
        status: 'Completed',
        description: 'Cross-functional panel affirmed product strategy depth.',
        gradient: 'from-amber-50 to-orange-50',
      },
      {
        id: 133,
        step: 3,
        title: 'Pair-Programming',
        icon: Clock,
        rating: '—',
        badge: 'Drafted',
        badgeColor: 'bg-purple-500 text-white',
        status: 'Awaiting',
        description: 'Offer memo waiting on comp committee sign-off.',
        gradient: 'from-purple-50 to-indigo-50',
      },
    ],
    activities: [
      {
        id: 231,
        icon: MessageCircle,
        title: 'Offer summary circulated with finance',
        timestamp: 'Added at 07.11.25 • 18:22',
      },
    ],
  },
  {
    id: 5,
    name: 'Arlene McCoy',
    role: 'Data Analyst',
    statusLabel: 'Screening',
    statusTone: 'bg-slate-200 text-slate-600',
    stageLabel: 'Screening',
    stageTone: 'bg-slate-200 text-slate-600',
    avatarGradient: 'from-[#f97316] to-[#f59e0b]',
    email: 'arlene.mccoy@example.com',
    assignedTo: 'Unassigned',
    timezone: 'UTC-3',
    statusNote: 'Yet to be assigned',
    createdOn: 'Jan 22, 2025',
    createdBy: 'Ashok Anbarasu',
    summary:
      'Resume review complete. Candidate prepping assessment prior to advancing to panel review.',
    location: 'Chicago, USA',
    rating: 3.6,
    badges: [
      { label: 'Data storyteller', tone: 'bg-orange-100 text-orange-700' },
    ],
    stages: [
      {
        id: 141,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '3.6',
        badge: 'Consider',
        badgeColor: 'bg-amber-500 text-white',
        status: 'In review',
        description: 'Recruiter verifying quantitative case study results.',
        gradient: 'from-amber-50 to-orange-50',
      },
      {
        id: 142,
        step: 2,
        title: 'Technical Round',
        icon: ClipboardCheck,
        rating: '—',
        badge: 'Pending',
        badgeColor: 'bg-slate-400 text-white',
        status: 'Awaiting',
        description: 'Assessment link shared and due in two days.',
        gradient: 'from-slate-50 to-gray-100',
      },
      {
        id: 143,
        step: 3,
        title: 'Pair-Programming',
        icon: Clock,
        rating: '—',
        badge: 'Pending',
        badgeColor: 'bg-slate-400 text-white',
        status: 'Upcoming',
        description: 'Panel to be scheduled post assessment scoring.',
        gradient: 'from-slate-50 to-gray-100',
      },
    ],
    activities: [
      {
        id: 241,
        icon: FileText,
        title: 'Shared analytics case study template',
        timestamp: 'Added at 02.11.25 • 09:30',
      },
    ],
  },
  {
    id: 6,
    name: 'Bessie Cooper',
    role: 'UX Researcher',
    statusLabel: 'Passed',
    statusTone: 'bg-emerald-100 text-emerald-700',
    stageLabel: 'Offer',
    stageTone: 'bg-emerald-100 text-emerald-700',
    avatarGradient: 'from-[#f472b6] to-[#ec4899]',
    email: 'bessie.cooper@example.com',
    assignedTo: 'Unassigned',
    timezone: 'UTC',
    statusNote: 'Yet to be assigned',
    createdOn: 'Feb 04, 2025',
    createdBy: 'Ashok Anbarasu',
    summary:
      'Offer accepted verbally. Background verification in progress with HR business partner.',
    location: 'Remote • Europe',
    rating: 4.3,
    badges: [
      { label: 'Research ops', tone: 'bg-pink-100 text-pink-700' },
      { label: 'Remote ready', tone: 'bg-sky-100 text-sky-600' },
    ],
    stages: [
      {
        id: 151,
        step: 1,
        title: 'Screening Round',
        icon: ThumbsUp,
        rating: '4.0',
        badge: 'Advance',
        badgeColor: 'bg-emerald-500 text-white',
        status: 'Completed',
        description: 'Recruiter discussion aligned with research charter.',
        gradient: 'from-emerald-50 to-teal-50',
      },
      {
        id: 152,
        step: 2,
        title: 'Technical Round',
        icon: Star,
        rating: '4.3',
        badge: 'Hire',
        badgeColor: 'bg-amber-500 text-white',
        status: 'Completed',
        description: 'Strong user empathy and synthesis showcased.',
        gradient: 'from-amber-50 to-orange-50',
      },
      {
        id: 153,
        step: 3,
        title: 'Pair-Programming',
        icon: ClipboardCheck,
        rating: '—',
        badge: 'Accepted',
        badgeColor: 'bg-purple-500 text-white',
        status: 'In progress',
        description: 'Final paperwork under review with legal.',
        gradient: 'from-purple-50 to-pink-50',
      },
    ],
    activities: [
      {
        id: 251,
        icon: Calendar,
        title: 'Background verification initiated',
        timestamp: 'Added at 06.11.25 • 11:05',
      },
    ],
  },
];

const stageToneMap: Record<
  string,
  { bg: string; badge: string; text: string }
> = {
  Completed: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    badge:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
    text: 'text-emerald-600 dark:text-emerald-200',
  },
  'In review': {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    badge:
      'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200',
    text: 'text-amber-600 dark:text-amber-200',
  },
  'Next step': {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    badge:
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200',
    text: 'text-indigo-600 dark:text-indigo-200',
  },
  Waiting: {
    bg: 'bg-slate-50 dark:bg-slate-700/40',
    badge:
      'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200',
    text: 'text-slate-600 dark:text-slate-200',
  },
};

const CandidatesPage: React.FC = () => {
  const role = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return candidatesData;

    return candidatesData.filter((candidate) =>
      [
        candidate.name,
        candidate.role,
        candidate.statusLabel,
        candidate.stageLabel,
        candidate.summary,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [searchTerm]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, index) => {
      const filled = rating >= index + 1 || rating >= index + 0.5;
      return (
        <Star
          key={index}
          className={`h-3 w-3 ${
            filled ? 'text-indigo-500' : 'text-gray-200 dark:text-gray-700'
          }`}
          fill={filled ? 'currentColor' : 'none'}
          strokeWidth={filled ? 0 : 1.5}
        />
      );
    });

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Candidates
              </h1>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                  Manage your interview pipeline, track statuses, and
                  collaborate with your hiring team.
              </p>
            </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
                  variant="outline"
                  className="h-9 w-full border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800 sm:h-8 sm:w-auto"
                >
                  Export Report
                </Button>
                <Button className="h-9 w-full bg-purple-600 px-3 text-xs font-semibold text-white hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 sm:h-8 sm:w-auto">
                  Invite Candidate
            </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <section className="space-y-3">
              <div className="border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <div className="relative w-full sm:flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search for role or candidate"
                      className="h-9 border border-gray-200 bg-white pl-9 text-xs text-gray-700 focus-visible:ring-1 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 sm:h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center">
                  <Button
                      className="h-9 w-full border border-gray-200 bg-white px-3 text-xs text-gray-500 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 sm:h-8 sm:w-8 sm:p-0"
                      variant="outline"
                    >
                      <Filter className="hidden h-3 w-3 sm:block" />
                      <span className="text-xs sm:hidden">Filter</span>
                    </Button>
                    <Button className="h-9 w-full bg-purple-600 px-3 text-xs text-white hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 sm:h-8 sm:w-8 sm:p-0">
                      <Plus className="hidden h-3 w-3 sm:block" />
                      <span className="text-xs sm:hidden">Add</span>
                  </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {filteredCandidates.length === 0 ? (
                  <div className="border border-dashed border-gray-200 bg-white p-4 text-center text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-gray-300">
                    No candidates matched this search.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {filteredCandidates.map((candidate) => {
                      const initials = candidate.name
                        .split(' ')
                        .map((chunk) => chunk[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      const primaryStage = candidate.stages[0];
                      const tone =
                        stageToneMap[primaryStage.status] ??
                        stageToneMap['Next step'];
                      const StageIcon = primaryStage.icon;

                      return (
                        <div
                    key={candidate.id}
                          className="flex h-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-400 sm:p-5"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 text-sm font-semibold text-indigo-700 dark:from-indigo-600/50 dark:to-purple-600/40 dark:text-indigo-100">
                                  {initials}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                      {candidate.name}
                                    </p>
                                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                                      {candidate.role}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                                      {candidate.location}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {candidate.email} • {candidate.timezone}
                                  </p>
                                  <div className="flex items-center gap-1 text-indigo-500">
                                    {renderStars(candidate.rating)}
                                    <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-300">
                                      {candidate.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`max-w-[160px] rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-center text-[11px] font-semibold leading-snug text-indigo-700 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200`}
                              >
                                {candidate.statusNote}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-gray-600 dark:text-gray-400">
                              <span>
                                <span className="font-semibold text-gray-500 dark:text-gray-300">
                                  Experience:
                                </span>{' '}
                                -
                              </span>
                              <span>
                                <span className="font-semibold text-gray-500 dark:text-gray-300">
                                  Notice Period:
                                </span>{' '}
                                -
                              </span>
                              <span>
                                <span className="font-semibold text-gray-500 dark:text-gray-300">
                                  Current CTC:
                                </span>{' '}
                                -
                              </span>
                              <span>
                                <span className="font-semibold text-gray-500 dark:text-gray-300">
                                  Stage:
                                </span>{' '}
                                {candidate.stageLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                                {candidate.assignedTo
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase() || 'UA'}
                              </div>
                              <div className="text-left text-gray-600 dark:text-gray-300">
                                <p className="font-semibold text-indigo-600 dark:text-indigo-200">
                                  {candidate.assignedTo || 'Unassigned'}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Created on {candidate.createdOn}
                                </p>
                              </div>
                            </div>
                            <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-200">
                              Created by {candidate.createdBy}
                            </p>
                          </div>

                          <div
                            className={`rounded-2xl border px-4 py-3 text-sm ${tone.bg} border-gray-100 dark:border-slate-700`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className={tone.text}>
                                {primaryStage.status}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] ${tone.badge}`}
                              >
                                {primaryStage.badge}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                              <StageIcon className="h-4 w-4 text-purple-600 dark:text-indigo-300" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {primaryStage.title}
                              </span>
                              <span className="font-medium text-purple-600 dark:text-indigo-300">
                                {primaryStage.rating}
                                  </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                              {primaryStage.description}
                        </p>
                      </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CandidatesPage;
