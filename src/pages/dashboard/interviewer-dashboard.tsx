import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Play,
  FileText,
  Star,
  MessageSquare,
  Video,
  UserCheck,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { INTERVIEWS } from '@/store/endpoints';
import { useAppSelector } from '@/store';
import { getUserFullName } from '@/types';

type Interview = {
  id: number;
  candidate: string;
  role: string;
  stage: string;
  datetime: string;
  duration: string;
  mode: 'Video' | 'Onsite' | 'Phone';
  meetingLink: string;
  location?: string;
  notes?: string;
  tags: string[];
  score?: number;
};

type FeedbackItem = {
  id: number;
  candidate: string;
  role: string;
  interviewDate: string;
  submittedBy: string;
  dueIn: string;
  focus: string[];
};

type Recording = {
  id: number;
  candidate: string;
  role: string;
  recordedAt: string;
  url: string;
};

const normalizeMode = (value?: string): Interview['mode'] => {
  if (!value) {
    return 'Video';
  }
  const mode = value.toLowerCase();
  if (mode.includes('phone') || mode.includes('call')) {
    return 'Phone';
  }
  if (
    mode.includes('site') ||
    mode.includes('office') ||
    mode.includes('room')
  ) {
    return 'Onsite';
  }
  return 'Video';
};

const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag));
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const getFirstAvailable = <T,>(
  ...values: Array<T | undefined | null>
): T | undefined =>
  values.find((value) => value !== undefined && value !== null);

const mapInterviewRecord = (
  record: Record<string, unknown>,
): Interview | null => {
  if (!record) {
    return null;
  }

  const idValue = getFirstAvailable(
    record.id,
    record.interview_id,
    record.uuid,
  );
  const candidateValue = getFirstAvailable(
    record.candidate?.name,
    record.candidate?.full_name,
    record.candidate_name,
    record.candidateName,
    record.name,
  );
  const roleValue = getFirstAvailable(
    record.role,
    record.role_title,
    record.position,
    record.job_title,
  );
  const datetimeValue = getFirstAvailable(
    record.datetime,
    record.scheduled_at,
    record.scheduledAt,
    record.start_time,
    record.startTime,
  );
  const meetingLinkValue = getFirstAvailable(
    record.meeting_link,
    record.meetingLink,
    record.link,
    record.url,
  );
  const stageValue = getFirstAvailable(
    record.stage,
    record.stage_label,
    record.current_stage,
    record.status,
  );
  const scoreValue = getFirstAvailable(
    record.score,
    record.rating,
    record.average_score,
  );
  const durationValue = getFirstAvailable(
    record.duration,
    record.expected_duration,
    record.length,
    record.meeting_duration,
  );
  const locationValue = getFirstAvailable(
    record.location,
    record.meeting_location,
    record.office,
    record.site,
  );
  const notesValue = getFirstAvailable(
    record.notes,
    record.brief,
    record.summary,
  );
  const modeValue = getFirstAvailable(
    record.mode,
    record.interview_mode,
    record.type,
  );

  const candidate = candidateValue ? String(candidateValue).trim() : '';
  if (!candidate) {
    return null;
  }

  const id =
    typeof idValue === 'number'
      ? idValue
      : idValue !== undefined &&
          idValue !== null &&
          !Number.isNaN(Number(idValue))
        ? Number(idValue)
        : Date.now();

  const isoDatetime =
    typeof datetimeValue === 'string'
      ? datetimeValue
      : datetimeValue instanceof Date
        ? datetimeValue.toISOString()
        : new Date().toISOString();

  const score =
    typeof scoreValue === 'number'
      ? scoreValue
      : scoreValue !== undefined && !Number.isNaN(Number(scoreValue))
        ? Number(scoreValue)
        : undefined;

  return {
    id,
    candidate,
    role: roleValue ? String(roleValue) : '—',
    stage: stageValue ? String(stageValue) : 'Upcoming interview',
    datetime: isoDatetime,
    duration: durationValue ? String(durationValue) : '45m',
    mode: normalizeMode(modeValue ? String(modeValue) : undefined),
    meetingLink: meetingLinkValue ? String(meetingLinkValue) : '#',
    location: locationValue ? String(locationValue) : undefined,
    notes: notesValue ? String(notesValue) : undefined,
    tags: parseTags(
      getFirstAvailable(
        record.tags,
        record.focus,
        record.labels,
        record.topics,
      ),
    ),
    score,
  };
};

const InterviewerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const fallbackInterviews = useMemo<Interview[]>(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const createDate = (dayOffset: number, hour: number, minute: number) => {
      const date = new Date(base);
      date.setDate(base.getDate() + dayOffset);
      date.setHours(hour, minute, 0, 0);
      return date.toISOString();
    };

    return [
      {
        id: 1,
        candidate: 'Emily Davis',
        role: 'Senior Product Designer',
        stage: 'Portfolio Review',
        datetime: createDate(0, 9, 30),
        duration: '45m',
        mode: 'Video',
        meetingLink: 'https://meet.example.com/emily-davis',
        tags: ['Design', 'Product'],
        notes: 'Focus on mobile-first workflow and system thinking',
        score: 4.6,
      },
      {
        id: 2,
        candidate: 'Michael Chen',
        role: 'Frontend Engineer',
        stage: 'Technical Deep Dive',
        datetime: createDate(0, 11, 0),
        duration: '60m',
        mode: 'Video',
        meetingLink: 'https://meet.example.com/michael-chen',
        tags: ['React', 'System Design'],
        notes: 'Prepare code review scenario and performance question',
        score: 4.9,
      },
      {
        id: 3,
        candidate: 'Sarah Johnson',
        role: 'Product Manager',
        stage: 'Leadership Round',
        datetime: createDate(0, 14, 0),
        duration: '40m',
        mode: 'Video',
        meetingLink: 'https://meet.example.com/sarah-johnson',
        tags: ['Strategy', 'Stakeholder'],
        notes: 'Evaluate cross-functional collaboration examples',
        score: 4.4,
      },
      {
        id: 4,
        candidate: 'David Park',
        role: 'Backend Engineer',
        stage: 'Systems Interview',
        datetime: createDate(1, 10, 30),
        duration: '60m',
        mode: 'Video',
        meetingLink: 'https://meet.example.com/david-park',
        tags: ['API Design', 'Scaling'],
        notes: 'Explore resiliency and observability practices',
        score: 4.8,
      },
      {
        id: 5,
        candidate: 'Alex Rivera',
        role: 'Data Scientist',
        stage: 'Panel Interview',
        datetime: createDate(2, 9, 0),
        duration: '90m',
        mode: 'Onsite',
        location: 'HQ - Boardroom 3A',
        meetingLink: 'https://meet.example.com/alex-rivera',
        tags: ['ML', 'Product Analytics'],
        notes: 'Bring whiteboard markers for on-site modelling',
        score: 4.3,
      },
      {
        id: 6,
        candidate: 'Priya Patel',
        role: 'Customer Success Lead',
        stage: 'Behavioural Round',
        datetime: createDate(3, 15, 0),
        duration: '45m',
        mode: 'Phone',
        meetingLink: 'tel:+15552345678',
        tags: ['Customer Stories', 'Escalation'],
        notes: 'Confirm timezone before the call',
        score: 4.7,
      },
    ];
  }, []);

  const [interviewData, setInterviewData] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchInterviews = async () => {
      try {
        setIsLoadingInterviews(true);
        setIsUsingFallback(false);

        const { httpClient } = initializeHttpClient();
        const params =
          user?.id !== undefined ? { interviewer_id: user.id } : undefined;
        const response = await httpClient.get(INTERVIEWS.LIST, {
          params,
        });

        const rawData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : Array.isArray(response.data)
              ? response.data
              : [];

        if (!Array.isArray(rawData)) {
          throw new Error('Unexpected interview data format.');
        }

        const normalized = rawData
          .map((item: Record<string, unknown>) => mapInterviewRecord(item))
          .filter((item): item is Interview => item !== null)
          .sort(
            (a, b) =>
              new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
          );

        if (isMounted) {
          if (normalized.length === 0) {
            setInterviewData(fallbackInterviews);
            setIsUsingFallback(true);
          } else {
            setInterviewData(normalized);
            setIsUsingFallback(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load interviewer dashboard data', error);
          setInterviewData(fallbackInterviews);
          setIsUsingFallback(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingInterviews(false);
        }
      }
    };

    fetchInterviews();

    return () => {
      isMounted = false;
    };
  }, [user?.id, fallbackInterviews]);

  const defaultPendingFeedback = useMemo<FeedbackItem[]>(
    () => [
      {
        id: 101,
        candidate: 'Jessica Martinez',
        role: 'Full Stack Developer',
        interviewDate: new Date().toISOString(),
        submittedBy: 'S. Lee',
        dueIn: '4 hrs',
        focus: ['Fullstack', 'Culture add'],
      },
      {
        id: 102,
        candidate: 'Robert Wilson',
        role: 'DevOps Engineer',
        interviewDate: new Date(Date.now() - 86400000).toISOString(),
        submittedBy: 'A. Carter',
        dueIn: 'Today',
        focus: ['Reliability', 'Automation'],
      },
      {
        id: 103,
        candidate: 'Lisa Anderson',
        role: 'Product Manager',
        interviewDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        submittedBy: 'You',
        dueIn: '1 day',
        focus: ['Product sense', 'Leadership'],
      },
    ],
    [],
  );

  const defaultRecordings = useMemo<Recording[]>(
    () => [
      {
        id: 201,
        candidate: 'Noah Bennett',
        role: 'QA Lead',
        recordedAt: '2025-11-04T14:00:00.000Z',
        url: '#',
      },
      {
        id: 202,
        candidate: 'Fatima Khan',
        role: 'Growth Marketer',
        recordedAt: '2025-11-03T16:30:00.000Z',
        url: '#',
      },
      {
        id: 203,
        candidate: 'Leo Martins',
        role: 'Data Analyst',
        recordedAt: '2025-11-01T10:00:00.000Z',
        url: '#',
      },
    ],
    [],
  );

  const userName = useMemo(() => {
    if (!user) {
      return 'Interviewer';
    }
    const fullName = getUserFullName(user);
    if (fullName.trim()) {
      return fullName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Interviewer';
  }, [user]);

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const upcomingSorted = useMemo(() => {
    const now = Date.now();
    return interviewData
      .filter((interview) => new Date(interview.datetime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      );
  }, [interviewData]);

  const pastInterviews = useMemo(() => {
    const now = Date.now();
    return interviewData.filter(
      (interview) => new Date(interview.datetime).getTime() < now,
    );
  }, [interviewData]);

  const feedbackFromData = useMemo<FeedbackItem[]>(() => {
    if (!interviewData.length) {
      return [];
    }
    const now = Date.now();
    const submittedByName =
      user && getUserFullName(user).trim()
        ? getUserFullName(user).trim()
        : 'You';

    return interviewData
      .filter((interview) => {
        const stage = interview.stage?.toLowerCase?.() ?? '';
        const interviewTime = new Date(interview.datetime).getTime();
        return (
          stage.includes('feedback') ||
          (interviewTime < now && stage.includes('review'))
        );
      })
      .slice(0, 5)
      .map((interview) => {
        const interviewDate = new Date(interview.datetime);
        const diffMs = Math.max(now - interviewDate.getTime(), 0);
        const diffHours = Math.max(1, Math.round(diffMs / 3600000));
        return {
          id: interview.id,
          candidate: interview.candidate,
          role: interview.role,
          interviewDate: interviewDate.toISOString(),
          submittedBy: submittedByName,
          dueIn:
            interviewDate.getTime() > now ? 'Due soon' : `${diffHours} hrs`,
          focus:
            interview.tags && interview.tags.length
              ? interview.tags.slice(0, 3)
              : [],
        };
      });
  }, [interviewData, user]);

  const pendingFeedback = useMemo<FeedbackItem[]>(() => {
    if (feedbackFromData.length) {
      return feedbackFromData;
    }
    if (isLoadingInterviews) {
      return [];
    }
    return defaultPendingFeedback;
  }, [defaultPendingFeedback, feedbackFromData, isLoadingInterviews]);

  const recordingsFromData = useMemo<Recording[]>(() => {
    if (!pastInterviews.length) {
      return [];
    }
    return [...pastInterviews]
      .sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
      )
      .slice(0, 4)
      .map((interview) => ({
        id: interview.id,
        candidate: interview.candidate,
        role: interview.role,
        recordedAt: interview.datetime,
        url: interview.meetingLink || '#',
      }));
  }, [pastInterviews]);

  const recordings = useMemo<Recording[]>(() => {
    if (recordingsFromData.length) {
      return recordingsFromData;
    }
    if (isLoadingInterviews) {
      return [];
    }
    return defaultRecordings;
  }, [defaultRecordings, isLoadingInterviews, recordingsFromData]);

  const averageScore = useMemo(() => {
    const scored = upcomingSorted.filter(
      (interview) => typeof interview.score === 'number',
    );
    if (!scored.length) {
      return null;
    }
    const total = scored.reduce(
      (sum, interview) => sum + (interview.score ?? 0),
      0,
    );
    return total / scored.length;
  }, [upcomingSorted]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const todaysInterviews = useMemo(
    () =>
      upcomingSorted.filter((interview) =>
        isSameDay(new Date(interview.datetime), today),
      ),
    [upcomingSorted, today],
  );

  const nextInterview = todaysInterviews[0] ?? upcomingSorted[0];

  const weeklyLoad = useMemo(() => {
    const start = new Date(today);
    const day = start.getDay();
    const mondayOffset = (day + 6) % 7; // Monday as start
    start.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const count = upcomingSorted.filter((interview) =>
        isSameDay(new Date(interview.datetime), date),
      ).length;
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date,
        count,
      };
    });
  }, [today, upcomingSorted]);

  const interviewDatesSet = useMemo(() => {
    const set = new Set<string>();
    upcomingSorted.forEach((interview) => {
      const date = new Date(interview.datetime);
      date.setHours(0, 0, 0, 0);
      set.add(date.toDateString());
    });
    return set;
  }, [upcomingSorted]);

  const calendarCells = useMemo(() => {
    const start = new Date(currentMonth);
    start.setDate(1);
    const firstWeekday = start.getDay();
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();

    const cells: Array<{
      key: string;
      day: number;
      date: Date;
      isCurrent: boolean;
    }> = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        -i,
      );
      cells.push({
        key: `prev-${i}`,
        day: date.getDate(),
        date,
        isCurrent: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      cells.push({ key: `cur-${day}`, day, date, isCurrent: true });
    }

    while (cells.length < 42) {
      const last = cells[cells.length - 1];
      const date = new Date(last.date);
      date.setDate(date.getDate() + 1);
      cells.push({
        key: `next-${cells.length}`,
        day: date.getDate(),
        date,
        isCurrent: false,
      });
    }

    return cells.slice(0, 42);
  }, [currentMonth]);

  const calendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const formatDate = (iso: string, options?: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...options,
    });

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailModalOpen(true);
  };

  const handlePrevMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(next);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const highlightCards = useMemo(
    () => [
      {
        id: 'today',
        title: "Today's Interviews",
        metric: isLoadingInterviews
          ? 'Loading…'
          : `${todaysInterviews.length} scheduled`,
        caption: isUsingFallback
          ? 'Showing sample schedule'
          : 'Stay prepared and on time',
        icon: Calendar,
        accent: 'bg-orange-100 text-orange-500',
        rate: isLoadingInterviews
          ? 'Syncing'
          : todaysInterviews.length
            ? isUsingFallback
              ? 'Sample data'
              : 'Live today'
            : isUsingFallback
              ? 'Sample data'
              : 'No sessions',
        type: isUsingFallback ? 'Sample data' : 'Live updates',
      },
      {
        id: 'feedback',
        title: 'Feedback Queue',
        metric: isLoadingInterviews
          ? 'Loading…'
          : `${pendingFeedback.length} open ${
              pendingFeedback.length === 1 ? 'item' : 'items'
            }`,
        caption: 'Share insights within 24h',
        icon: MessageSquare,
        accent: 'bg-purple-100 text-purple-500',
        rate: isLoadingInterviews
          ? 'Syncing'
          : pendingFeedback.length
            ? isUsingFallback
              ? 'Sample data'
              : 'Action needed'
            : 'All clear',
        type: isUsingFallback ? 'Sample data' : 'Feedback status',
      },
      {
        id: 'recordings',
        title: 'Recent Recordings',
        metric: isLoadingInterviews
          ? 'Loading…'
          : `${recordings.length} to review`,
        caption: 'Catch up on highlights',
        icon: Video,
        accent: 'bg-blue-100 text-blue-500',
        rate: isLoadingInterviews
          ? 'Syncing'
          : recordings.length
            ? isUsingFallback
              ? 'Sample data'
              : 'New updates'
            : 'Nothing pending',
        type: isUsingFallback ? 'Sample data' : 'This week',
      },
      {
        id: 'pipeline',
        title: 'Active Pipeline',
        metric: isLoadingInterviews
          ? 'Loading…'
          : `${upcomingSorted.length} candidates`,
        caption: 'Across all roles assigned',
        icon: UserCheck,
        accent: 'bg-emerald-100 text-emerald-500',
        rate: isLoadingInterviews
          ? 'Syncing'
          : averageScore !== null
            ? `${averageScore.toFixed(1)}⭐ avg`
            : isUsingFallback
              ? 'Sample data'
              : 'No score yet',
        type: isUsingFallback ? 'Sample data' : 'Candidate rating',
      },
    ],
    [
      averageScore,
      isLoadingInterviews,
      isUsingFallback,
      pendingFeedback.length,
      recordings.length,
      todaysInterviews.length,
      upcomingSorted.length,
    ],
  );

  const pipelineItems = upcomingSorted.slice(0, 3).map((interview) => {
    const progress = Math.round(((interview.score ?? 4.5) / 5) * 100);
    return {
      id: interview.id,
      title: interview.role,
      candidate: interview.candidate,
      remaining: `${Math.max(1, Math.round(Math.random() * 8))}h ${Math.max(
        1,
        Math.round(Math.random() * 45),
      )}m`,
      status: interview.stage,
      progress,
    };
  });

  const assignments = pendingFeedback.map((item, index) => {
    const status =
      index === 0 ? 'In progress' : index === 1 ? 'Completed' : 'Upcoming';
    return {
      id: item.id,
      title: item.candidate,
      subtitle: item.role,
      status,
      date: new Date(item.interviewDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  });

  const statusStyles: Record<string, string> = {
    'In progress':
      'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200',
    Completed:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
    Upcoming:
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200',
  };

  const monthLabel = currentMonth.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const courseCards = pipelineItems.map((item) => ({
    id: item.id,
    title: item.title,
    candidate: item.candidate,
    status: item.status,
    progress: item.progress,
  }));

  return (
    <div className="min-h-screen space-y-4 p-3 sm:p-5 lg:p-2">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {userName}{' '}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Here’s a snapshot of today’s interviews, prep work, and follow-ups.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <Search className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search interviews"
              className="w-32 bg-transparent text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-gray-300">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Today’s Highlight
            </p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {isLoadingInterviews
                ? 'Loading your next interview…'
                : nextInterview
                  ? `${nextInterview.candidate} • ${nextInterview.stage}`
                  : isUsingFallback
                    ? 'No live interviews scheduled'
                    : 'No interviews scheduled'}
            </h2>
            {nextInterview && !isLoadingInterviews && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {formatDate(nextInterview.datetime, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • {formatTime(nextInterview.datetime)} • {nextInterview.mode}
              </p>
            )}
            {!nextInterview && !isLoadingInterviews && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {isUsingFallback
                  ? 'Showing sample schedule. Connect to live data to view your actual interviews.'
                  : 'You’re all caught up for today.'}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            {nextInterview && (
              <Button
                size="sm"
                className="h-8 rounded-2xl bg-purple-600 px-3 text-xs font-semibold text-white shadow hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                onClick={() => window.open(nextInterview.meetingLink, '_blank')}
              >
                <Play className="h-3 w-3" /> Join call
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-2xl border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={() => nextInterview && handleViewDetails(nextInterview)}
            >
              <FileText className="h-3 w-3" /> View brief
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Quick insights
          </h2>
          <button className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
            View all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {card.metric}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{card.caption}</span>
                  <span className="font-semibold text-indigo-500 dark:text-indigo-200">
                    {card.rate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Hours activity
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-emerald-500">
                    +3% increase than last week
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                  Weekly
                </span>
              </div>
              <div className="mt-5 grid h-40 grid-cols-7 items-end gap-2">
                {weeklyLoad.map((entry) => (
                  <div
                    key={entry.label}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-3 rounded-full bg-indigo-400 transition-all dark:bg-indigo-500"
                      style={{ height: `${Math.max(entry.count * 20, 6)}px` }}
                    />
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {entry.label.charAt(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Daily schedule
                </h3>
                <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                  Today <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {isLoadingInterviews && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fetching your schedule…
                  </p>
                )}
                {!isLoadingInterviews && todaysInterviews.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isUsingFallback
                      ? 'No interviews scheduled in sample data.'
                      : 'No interviews scheduled today.'}
                  </p>
                )}
                {!isLoadingInterviews &&
                  todaysInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => handleViewDetails(interview)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-3.5 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                          {interview.candidate
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {interview.candidate}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {interview.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(interview.datetime)}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Candidate pipeline
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Review upcoming stages for top candidates.
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                Active <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {courseCards.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {course.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      With {course.candidate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-200">
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-200">
                  Interview assist
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                  Get coaching notes & templates
                </h3>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Join our enablement program to receive interview scripts,
                  rubrics, and best practices.
                </p>
              </div>
              <div className="hidden sm:block h-16 w-16 rounded-full bg-purple-100/80 dark:bg-indigo-500/20" />
            </div>
            <Button className="mt-3 h-8 w-full rounded-2xl bg-purple-600 text-xs font-semibold text-white hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
              Get Access
            </Button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {monthLabel}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500">
              {calendarWeekdays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5 text-xs">
              {calendarCells.map((cell) => {
                const cellDate = cell.date.toDateString();
                const isToday = isSameDay(cell.date, today);
                const hasInterview = interviewDatesSet.has(cellDate);
                return (
                  <button
                    key={cell.key}
                    className={`flex h-9 items-center justify-center rounded-xl border text-xs transition ${
                      cell.isCurrent
                        ? 'border-transparent bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200'
                        : 'border-transparent text-gray-400 dark:text-gray-500'
                    } ${hasInterview ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''} ${
                      isToday
                        ? 'bg-purple-100 text-purple-600 dark:bg-indigo-500/30 dark:text-indigo-200'
                        : ''
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Assignments
              </h3>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                Add <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {pendingFeedback.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isLoadingInterviews
                    ? 'Fetching assignments…'
                    : isUsingFallback
                      ? 'No assignments pending in sample data.'
                      : 'No assignments pending.'}
                </p>
              )}
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {assignment.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {assignment.subtitle}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {assignment.date}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[assignment.status]}`}
                  >
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
          {selectedInterview && (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedInterview.candidate}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedInterview.role} • {selectedInterview.stage}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {formatDate(selectedInterview.datetime, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      {formatTime(selectedInterview.datetime)} •{' '}
                      {selectedInterview.duration}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Mode: {selectedInterview.mode}
                      {selectedInterview.location
                        ? ` • ${selectedInterview.location}`
                        : ''}
                    </div>
                  </div>
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-indigo-500 dark:text-indigo-200 font-semibold">
                      Preparation focus
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-indigo-700 dark:text-indigo-200">
                      {selectedInterview.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-white dark:bg-slate-900/70 border border-indigo-100 dark:border-indigo-500/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {selectedInterview.score && (
                      <div className="text-xs text-indigo-700 dark:text-indigo-200 mt-3 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> Candidate rating so
                        far: {selectedInterview.score}/5
                      </div>
                    )}
                  </div>
                </div>

                {selectedInterview.notes && (
                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 p-4 text-sm text-gray-600 dark:text-gray-300">
                    {selectedInterview.notes}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      window.open(selectedInterview.meetingLink, '_blank')
                    }
                  >
                    <Play className="w-4 h-4" /> Join meeting
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewerDashboard;
