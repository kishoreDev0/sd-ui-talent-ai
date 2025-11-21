import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users2,
  Target,
  Check,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createInterviewRound,
  listInterviewRounds,
  updateRoundStatus,
} from '@/store/interviews/service/interviewService';
import type {
  InterviewRound,
  InterviewRoundCreatePayload,
  PanelAssignmentInput,
} from '@/store/interviews/types/interviewTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CustomSelect from '@/components/ui/custom-select';
import { useToast } from '@/components/ui/toast';
import {
  listCandidates,
  getCandidateById,
} from '@/store/candidate/service/candidateService';
import { getAllJobs } from '@/store/job/service/jobService';
import { UserAPI } from '@/store/service/user/userService';
import type { User } from '@/store/types/user/userTypes';
import InterviewHosting from '@/components/interview/interview-hosting';

const buildTimezoneOptions = () => {
  let zones: string[] = [];
  try {
    const intlWithSupport = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    if (typeof intlWithSupport.supportedValuesOf === 'function') {
      zones = intlWithSupport.supportedValuesOf('timeZone');
    }
  } catch {
    // ignored – fallback list below
  }
  if (!zones.length) {
    zones = [
      'UTC',
      'Etc/GMT',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'Europe/London',
      'Europe/Berlin',
      'Europe/Paris',
      'Europe/Moscow',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];
  }

  const now = new Date();

  const formatOffset = (zone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      });
      const tzName = formatter
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value;
      if (!tzName) return 'GMT';
      const match = tzName.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/i);
      if (!match) return tzName.toUpperCase();
      const hourValue = Number(match[1]);
      const minuteValue = match[2] ? Number(match[2]) : 0;
      const sign = hourValue >= 0 ? '+' : '-';
      const paddedHours = Math.abs(hourValue).toString().padStart(2, '0');
      const paddedMinutes = minuteValue.toString().padStart(2, '0');
      return `GMT${sign}${paddedHours}:${paddedMinutes}`;
    } catch {
      return 'GMT';
    }
  };

  const formatLongName = (zone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        timeZoneName: 'long',
      });
      const tzName = formatter
        .formatToParts(now)
        .find((part) => part.type === 'timeZoneName')?.value;
      return tzName ?? zone.replace(/_/g, ' ');
    } catch {
      return zone.replace(/_/g, ' ');
    }
  };

  return zones
    .map((zone) => {
      const offset = formatOffset(zone);
      const longName = formatLongName(zone);
      const location = zone.split('/').slice(1).join(' / ').replace(/_/g, ' ');
      const descriptor = location ? `${longName} - ${location}` : longName;
      return {
        value: zone,
        label: `(${offset}) ${descriptor}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

const InterviewsPage: React.FC = () => {
  const role = useUserRole();
  const { showToast } = useToast();
  const userApi = useMemo(() => new UserAPI(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Monday=0
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline'>(
    'calendar',
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [isLoadingRounds, setIsLoadingRounds] = useState<boolean>(true);
  const [roundsError, setRoundsError] = useState<string | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isSubmittingRound, setIsSubmittingRound] = useState(false);
  const [schedulerData, setSchedulerData] = useState<
    InterviewRoundCreatePayload & { panel: PanelAssignmentInput[] }
  >({
    round_name: '',
    stage: '',
    scheduled_start: new Date().toISOString().slice(0, 16),
    duration_minutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    recording_enabled: true,
    panel: [],
  });
  const [selectedRound, setSelectedRound] = useState<InterviewRound | null>(
    null,
  );
  const [isRoundDetailOpen, setIsRoundDetailOpen] = useState(false);
  const [isHostingInterfaceOpen, setIsHostingInterfaceOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const schedulerSteps = useMemo(
    () => [
      {
        key: 'details',
        title: 'Details',
        helper: 'Select candidate, job, and timing',
      },
      {
        key: 'panel',
        title: 'Panel & Recording',
        helper: 'Assign panelists and notes',
      },
    ],
    [],
  );
  const [schedulerStep, setSchedulerStep] = useState(0);
  const [candidateNameMap, setCandidateNameMap] = useState<
    Record<number, string>
  >({});
  const [candidateOptions, setCandidateOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [jobOptions, setJobOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [panelistOptions, setPanelistOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [panelistNameMap, setPanelistNameMap] = useState<
    Record<number, string>
  >({});
  const timezoneOptions = useMemo(buildTimezoneOptions, []);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const fetchRounds = useCallback(async () => {
    try {
      setIsLoadingRounds(true);
      const payload = await listInterviewRounds({ page: 1, pageSize: 100 });
      setRounds(payload.result);
      setRoundsError(null);
    } catch (error) {
      console.error('Failed to load interview rounds', error);
      setRounds([]);
      setRoundsError('Unable to load interview rounds right now.');
    } finally {
      setIsLoadingRounds(false);
    }
  }, []);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  const loadSchedulerOptions = useCallback(async () => {
    try {
      setIsLoadingOptions(true);
      const [candidatePayload, jobPayload, panelPayload] = await Promise.all([
        listCandidates({ page: 1, pageSize: 50 }),
        getAllJobs({ page: 1, page_size: 50 }),
        userApi.getAllUsers({
          page: 1,
          page_size: 100,
          is_active: true,
        }),
      ]);
      const candidateNameEntries: Record<number, string> = {};
      const candidateOpts =
        candidatePayload.result?.map((candidate) => {
          const name =
            `${candidate.first_name ?? ''} ${candidate.last_name ?? ''}`.trim() ||
            candidate.resume_title ||
            candidate.email ||
            '';
          if (candidate.id) {
            candidateNameEntries[candidate.id] =
              name || `Candidate #${candidate.id}`;
          }
          return {
            label:
              name ||
              `Candidate #${candidate.id ?? Math.random().toString(36)}`,
            value: candidate.id?.toString() ?? '',
          };
        }) ?? [];
      if (Object.keys(candidateNameEntries).length > 0) {
        setCandidateNameMap((prev) => ({
          ...candidateNameEntries,
          ...prev,
        }));
      }
      const jobOpts =
        jobPayload.result?.map((job) => ({
          label: `${job.job_title} • ${job.organization}`,
          value: job.id.toString(),
        })) ?? [];
      const panelUsers: User[] = (panelPayload.data?.data?.result ?? []).filter(
        (user: User) => {
          // Exclude admin users - check if role name is 'admin' (case insensitive)
          const roleName = user.role?.name?.toLowerCase() || '';
          return roleName !== 'admin';
        },
      );
      const panelNameEntries: Record<number, string> = {};
      const panelOpts =
        panelUsers.map((user) => {
          const displayName =
            `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
            user.email ||
            `Panelist #${user.id}`;
          panelNameEntries[user.id] = displayName;
          return {
            label: `${displayName}${user.email ? ` • ${user.email}` : ''}`,
            value: user.id.toString(),
          };
        }) ?? [];
      if (Object.keys(panelNameEntries).length > 0) {
        setPanelistNameMap((prev) => ({
          ...panelNameEntries,
          ...prev,
        }));
      }
      setCandidateOptions(candidateOpts);
      setJobOptions(jobOpts);
      setPanelistOptions(panelOpts);
      setOptionsError(null);
    } catch (error) {
      console.error('Failed to load scheduler options', error);
      setOptionsError('Unable to load candidates or jobs for scheduling.');
    } finally {
      setIsLoadingOptions(false);
    }
  }, [userApi]);

  useEffect(() => {
    loadSchedulerOptions();
  }, [loadSchedulerOptions]);

  useEffect(() => {
    if (!isSchedulerOpen) {
      setSchedulerStep(0);
    }
  }, [isSchedulerOpen]);
  const hydrateCandidateNames = useCallback(
    async (data: InterviewRound[]) => {
      const missingIds = Array.from(
        new Set(
          data
            .map((round) => round.candidate_id)
            .filter(
              (id): id is number =>
                Boolean(id) && candidateNameMap[id as number] === undefined,
            ),
        ),
      );

      if (!missingIds.length) return;

      try {
        const entries = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const candidate = await getCandidateById(id);
              const displayName =
                `${candidate.first_name ?? ''} ${candidate.last_name ?? ''}`.trim() ||
                candidate.resume_title ||
                candidate.email ||
                `Candidate #${id}`;
              return [id, displayName] as const;
            } catch (error) {
              console.warn('Unable to load candidate name', id, error);
              return [id, `Candidate #${id}`] as const;
            }
          }),
        );
        setCandidateNameMap((prev) => ({
          ...prev,
          ...Object.fromEntries(entries),
        }));
      } catch (error) {
        console.error('Failed to hydrate candidate names', error);
      }
    },
    [candidateNameMap],
  );

  const hydratePanelistNames = useCallback(
    async (data: InterviewRound[]) => {
      const missingIds = Array.from(
        new Set(
          data
            .flatMap(
              (round) =>
                round.panel_assignments?.map((panel) => panel.interviewer_id) ??
                [],
            )
            .filter(
              (id): id is number =>
                Boolean(id) && panelistNameMap[id as number] === undefined,
            ),
        ),
      );

      if (!missingIds.length) return;

      try {
        const entries = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const response = await userApi.getUserById(id);
              const user = response.data?.data?.data;
              const displayName =
                `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
                user?.email ||
                `Panelist #${id}`;
              return [id, displayName] as const;
            } catch (error) {
              console.warn('Unable to load panelist name', id, error);
              return [id, `Panelist #${id}`] as const;
            }
          }),
        );
        setPanelistNameMap((prev) => ({
          ...prev,
          ...Object.fromEntries(entries),
        }));
      } catch (error) {
        console.error('Failed to hydrate panelist names', error);
      }
    },
    [panelistNameMap, userApi],
  );

  const validateSchedulerDetailsStep = useCallback(() => {
    if (!schedulerData.round_name?.trim()) {
      showToast('Round title is required', 'error');
      return false;
    }
    if (!schedulerData.candidate_id) {
      showToast('Select a candidate to continue', 'error');
      return false;
    }
    if (!schedulerData.job_id) {
      showToast('Select a job / requisition to continue', 'error');
      return false;
    }
    if (!schedulerData.scheduled_start) {
      showToast('Pick a start date & time', 'error');
      return false;
    }
    if (!schedulerData.timezone) {
      showToast('Select a timezone', 'error');
      return false;
    }
    return true;
  }, [
    schedulerData.round_name,
    schedulerData.candidate_id,
    schedulerData.job_id,
    schedulerData.scheduled_start,
    schedulerData.timezone,
    showToast,
  ]);

  const isLastSchedulerStep = schedulerStep === schedulerSteps.length - 1;

  const handleSchedulerNext = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (isLastSchedulerStep) {
        return;
      }
      if (schedulerStep === 0 && !validateSchedulerDetailsStep()) {
        return;
      }
      setSchedulerStep((prev) => Math.min(prev + 1, schedulerSteps.length - 1));
    },
    [
      isLastSchedulerStep,
      schedulerStep,
      schedulerSteps.length,
      validateSchedulerDetailsStep,
    ],
  );

  const handleSchedulerBack = useCallback(() => {
    if (schedulerStep === 0) {
      return;
    }
    setSchedulerStep((prev) => Math.max(prev - 1, 0));
  }, [schedulerStep]);

  useEffect(() => {
    if (rounds.length) {
      hydrateCandidateNames(rounds);
      hydratePanelistNames(rounds);
    }
  }, [rounds, hydrateCandidateNames, hydratePanelistNames]);

  const formatTimeWindow = (start: Date, durationMinutes: number) => {
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  };

  const derivePriorityFromRound = (
    round: InterviewRound,
  ): 'High' | 'Medium' | 'Low' => {
    if (round.stage?.toLowerCase().includes('panel')) return 'High';
    if (round.status === 'completed' || round.status === 'in_progress')
      return 'High';
    if (round.status === 'needs_feedback') return 'Medium';
    return 'Low';
  };

  const interviews = useMemo(() => {
    return rounds.map((round) => {
      const startDate = new Date(round.scheduled_start);
      const duration = round.duration_minutes || 60;
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
      const isoDate = startDate.toISOString().split('T')[0];
      return {
        id: round.id,
        name: round.round_name,
        candidateName:
          (round.candidate_id && candidateNameMap[round.candidate_id]) || null,
        role: round.stage || 'Interview Round',
        date: isoDate,
        time: formatTimeWindow(startDate, duration),
        status: round.status || 'scheduled',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        priority: derivePriorityFromRound(round),
        meetingUrl: round.meeting_url,
      };
    });
  }, [rounds]);

  const roundStats = useMemo(() => {
    const upcoming = rounds.filter(
      (round) => round.status === 'scheduled',
    ).length;
    const inProgress = rounds.filter(
      (round) => round.status === 'in_progress',
    ).length;
    const needsFeedback = rounds.filter(
      (round) => round.status === 'needs_feedback',
    ).length;
    const completed = rounds.filter(
      (round) => round.status === 'completed',
    ).length;
    return { upcoming, inProgress, needsFeedback, completed };
  }, [rounds]);

  const openRoundDetails = (roundId: number) => {
    // Open hosting interface instead of drawer
    const found = rounds.find((item) => item.id === roundId);
    if (found) {
      setSelectedRound(found);
      setIsHostingInterfaceOpen(true);
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'needs_feedback':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleStatusUpdate = async (
    roundId: number,
    status: string,
    successMessage: string,
  ) => {
    try {
      setIsUpdatingStatus(true);
      const updated = await updateRoundStatus(roundId, status);
      showToast(successMessage, 'success');
      setSelectedRound(updated);
      await fetchRounds();
    } catch (error) {
      console.error('Failed to update interview status', error);
      showToast('Unable to update interview status right now.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartMeeting = () => {
    if (!selectedRound?.meeting_url || !selectedRound?.id) return;
    window.open(selectedRound.meeting_url, '_blank', 'noopener,noreferrer');
    if (selectedRound.status !== 'in_progress') {
      handleStatusUpdate(
        selectedRound.id,
        'in_progress',
        'Interview marked as In Progress.',
      );
    }
  };

  const handleMarkCompleted = () => {
    if (!selectedRound?.id) return;
    handleStatusUpdate(
      selectedRound.id,
      'needs_feedback',
      'Interview marked as completed. Awaiting feedback.',
    );
  };

  const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, delta: number) =>
    new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const getMonthMatrix = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDay = (start.getDay() + 6) % 7; // Monday=0
    const daysInMonth = end.getDate();
    const cells: Array<{ d: number | null; date?: Date }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ d: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(date.getFullYear(), date.getMonth(), d);
      cells.push({ d, date: cellDate });
    }
    while (cells.length % 7 !== 0) cells.push({ d: null });
    return cells;
  };

  const parseTimeToMinutes = (time?: string): number => {
    if (!time) return 0;
    const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const mer = (m[3] || '').toUpperCase();
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      return h * 60 + mm;
    }
    const s = time.match(/(\d{1,2}):(\d{2})/);
    return s ? parseInt(s[1], 10) * 60 + parseInt(s[2], 10) : 0;
  };

  const eventColor = (p?: string) =>
    p === 'High'
      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-900/40'
      : p === 'Medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900/40'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900/40';

  // Timeline helpers
  const weekEnd = new Date(
    currentWeekStart.getFullYear(),
    currentWeekStart.getMonth(),
    currentWeekStart.getDate() + 6,
  );
  const nextWeek = () =>
    setCurrentWeekStart(
      new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() + 7,
      ),
    );
  const prevWeek = () =>
    setCurrentWeekStart(
      new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() - 7,
      ),
    );
  const dayDiff = (a: Date, b: Date) =>
    Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <MainLayout role={role}>
      <div className="space-y-4 lg:p-2 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Interviews
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              Scheduled interviews overview
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden text-xs">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 ${viewMode === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
              >
                List
              </button>
            </div>
            <Button
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm"
              onClick={() => setIsSchedulerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule Round
            </Button>
          </div>
        </div>
        {roundsError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {roundsError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3">
            <div className="text-xs text-gray-500">Upcoming</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {roundStats.upcoming}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3">
            <div className="text-xs text-gray-500">In Progress</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {roundStats.inProgress}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3">
            <div className="text-xs text-gray-500">Needs Feedback</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {roundStats.needsFeedback}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {roundStats.completed}
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white/95 dark:bg-slate-800/80 rounded-xl p-4 shadow border border-gray-200 dark:border-white/10">
            {/* Top controls like reference design */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}{' '}
                {selectedDate.getDate()}
                <sup className="text-xs align-super">
                  {
                    ['th', 'st', 'nd', 'rd'][
                      ((d) => {
                        const v = d % 100;
                        return v > 10 && v < 14
                          ? 0
                          : [0, 1, 2, 3][Math.min(3, v % 10)];
                      })(selectedDate.getDate())
                    ]
                  }
                </sup>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  className="h-8 w-8 rounded border border-gray-200 dark:border-white/10 text-sm flex items-center justify-center"
                >
                  ‹
                </button>
                <div className="px-2 text-gray-700 dark:text-gray-200 min-w-[120px] text-center">
                  {currentMonth.toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="h-8 w-8 rounded border border-gray-200 dark:border-white/10 text-sm flex items-center justify-center"
                >
                  ›
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10">
                  Filter
                </button>
                <button className="px-3 py-1 rounded bg-indigo-600 text-white">
                  + Add new
                </button>
              </div>
            </div>
            {/* Weekday header with active day */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                (d, idx) => {
                  const isActive = (selectedDate.getDay() + 6) % 7 === idx;
                  return (
                    <div
                      key={d}
                      className={`text-center text-xs py-2 rounded ${isActive ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {d}
                    </div>
                  );
                },
              )}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getMonthMatrix(currentMonth).map((cell, idx) => {
                const dayEvents = cell.date
                  ? interviews.filter(
                      (e) =>
                        e.date &&
                        new Date(e.date).toDateString() ===
                          cell.date!.toDateString(),
                    )
                  : [];
                return (
                  <div
                    key={idx}
                    onClick={() => cell.date && setSelectedDate(cell.date)}
                    className={`cursor-pointer min-h-24 rounded-lg border border-gray-200 dark:border-white/10 p-2 ${cell.d ? 'bg-white/70 dark:bg-slate-900/40' : 'bg-transparent'} ${cell.date && cell.date.toDateString() === selectedDate.toDateString() ? 'ring-1 ring-orange-400' : ''}`}
                  >
                    <div className="text-right text-[10px] text-gray-500 dark:text-gray-400">
                      {cell.d || ''}
                    </div>
                    <div className="space-y-1 mt-1 max-h-20 overflow-y-auto pr-1">
                      {dayEvents.map((ev) => (
                        <button
                          key={`${ev.id}-${ev.time}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(cell.date!);
                            setIsDayModalOpen(true);
                          }}
                          className={`w-full text-left text-[11px] px-2 py-2 rounded-lg border ${eventColor(ev.priority)} truncate hover:opacity-90`}
                        >
                          <div className="font-medium truncate">{ev.name}</div>
                          <div className="text-[10px] opacity-80 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.time}
                          </div>
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isLoadingRounds && (
              <p className="mt-3 text-xs text-gray-500">Loading interviews…</p>
            )}
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="bg-white/95 dark:bg-slate-800/80 rounded-xl p-4 shadow border border-gray-200 dark:border-white/10">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-3 text-xs">
              <div className="text-gray-700 dark:text-gray-200">
                {currentWeekStart.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {weekEnd.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevWeek}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-white/10"
                >
                  Prev
                </button>
                <button
                  onClick={nextWeek}
                  className="px-3 py-1 rounded border border-gray-200 dark:border-white/10"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-xs text-gray-500 dark:text-gray-400 mb-2">
              {[...Array(7)].map((_, i) => {
                const d = new Date(
                  currentWeekStart.getFullYear(),
                  currentWeekStart.getMonth(),
                  currentWeekStart.getDate() + i,
                );
                return (
                  <div key={i} className="p-2 text-center">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                    <span className="text-[10px]">{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
            <div className="relative w-full">
              <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/30"
                  />
                ))}
              </div>
              <div className="absolute inset-0 p-1">
                <div className="grid grid-cols-7 gap-2 h-full">
                  {interviews.map((ev) => {
                    const s = new Date(ev.start);
                    const e = new Date(ev.end);
                    const startIdx = Math.max(
                      0,
                      Math.min(6, dayDiff(s, currentWeekStart)),
                    );
                    const endIdx = Math.max(
                      0,
                      Math.min(6, dayDiff(e, currentWeekStart)),
                    );
                    if (endIdx < 0 || startIdx > 6) return null;
                    const span =
                      Math.min(6, endIdx) - Math.max(0, startIdx) + 1;
                    const badge =
                      ev.priority === 'High'
                        ? 'bg-rose-500'
                        : ev.priority === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500';
                    return (
                      <div
                        key={`bar-${ev.id}`}
                        style={{ gridColumn: `${startIdx + 1} / span ${span}` }}
                        className="flex items-center"
                      >
                        <div
                          className={`w-full h-9 rounded-xl bg-white dark:bg-slate-800 shadow border border-gray-200 dark:border-white/10 relative overflow-hidden`}
                        >
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${badge}`}
                          />
                          <div className="px-3 py-1 text-xs text-gray-800 dark:text-gray-100 flex items-center justify-between h-full">
                            <span className="truncate mr-2">
                              {ev.name} — {ev.role}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-300">
                              {new Date(ev.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              {ev.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isLoadingRounds && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                    Loading interviews…
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 dark:bg-slate-800/80 rounded-xl p-4 shadow border border-gray-200 dark:border-white/10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Scheduled Interviews
            </h2>
            {isLoadingRounds ? (
              <p className="text-xs text-gray-500">Loading interviews…</p>
            ) : interviews.length === 0 ? (
              <p className="text-xs text-gray-500">
                No interviews scheduled for this period.
              </p>
            ) : (
              <div className="space-y-2">
                {interviews.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => openRoundDetails(i.id)}
                    className="w-full text-left bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-white/10 hover:border-indigo-200 focus:ring-1 focus:ring-indigo-400"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {i.name}
                        </div>
                        {i.candidateName && (
                          <div className="text-[11px] text-gray-500">
                            Candidate: {i.candidateName}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-600 dark:text-gray-300">
                          {i.role}
                        </div>
                        <span
                          className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border ${statusBadgeClass(i.status)}`}
                        >
                          {i.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                        <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />
                        <span>
                          {new Date(i.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at {i.time}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day schedule modal for calendar view */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Interviews on{' '}
              {selectedDay
                ? selectedDay.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </DialogTitle>
            <DialogDescription>
              Click play to join the meeting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {interviews
              .filter(
                (i) =>
                  selectedDay &&
                  new Date(i.date).toDateString() ===
                    selectedDay.toDateString(),
              )
              .sort(
                (a, b) =>
                  parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
              )
              .map((i) => (
                <div
                  key={`${i.id}-${i.time}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {i.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {i.role}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200 mt-1">
                      <Clock className="w-3 h-3" /> {i.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full border ${eventColor(i.priority)} capitalize`}
                    >
                      {i.status?.toLowerCase() || 'scheduled'}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full border ${eventColor(i.priority)} capitalize`}
                    >
                      {(i.priority || 'normal').toString()}
                    </span>
                    <button
                      onClick={() => {
                        setIsDayModalOpen(false);
                        openRoundDetails(i.id);
                      }}
                      className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview Round</DialogTitle>
            <DialogDescription>
              Assign panelists, link a candidate/job, and generate a meeting.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              // Only submit if we're on the last step
              if (!isLastSchedulerStep) {
                return;
              }
              try {
                setIsSubmittingRound(true);
                await createInterviewRound({
                  ...schedulerData,
                  scheduled_start: new Date(
                    schedulerData.scheduled_start ?? new Date().toISOString(),
                  ).toISOString(),
                });
                showToast('Interview round scheduled successfully', 'success');
                setIsSchedulerOpen(false);
                await fetchRounds();
              } catch (error) {
                console.error('Failed to schedule round', error);
                showToast(
                  'Unable to schedule interview round right now.',
                  'error',
                );
              } finally {
                setIsSubmittingRound(false);
              }
            }}
          >
            {optionsError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                {optionsError}
              </p>
            )}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                  {schedulerSteps.map((step, index) => (
                    <div key={step.key} className="flex items-center min-w-0">
                      <div className="flex flex-col items-center text-center flex-shrink-0 px-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-colors ${
                            index <= schedulerStep
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-500 bg-white'
                          }`}
                        >
                          {index < schedulerStep ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-gray-700 mt-1">
                          {step.title}
                        </div>
                        <div className="text-[10px] text-gray-500 hidden sm:block">
                          {step.helper}
                        </div>
                      </div>
                      {index < schedulerSteps.length - 1 && (
                        <div
                          className={`w-16 sm:w-24 h-px mx-2 sm:mx-3 ${
                            index < schedulerStep
                              ? 'bg-indigo-600'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {schedulerStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Round Title
                  </label>
                  <Input
                    value={schedulerData.round_name}
                    onChange={(event) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        round_name: event.target.value,
                      }))
                    }
                    placeholder="Technical Interview, Panel Discussion, etc."
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Stage / Pipeline Step
                  </label>
                  <Input
                    value={schedulerData.stage ?? ''}
                    onChange={(event) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        stage: event.target.value,
                      }))
                    }
                    placeholder="Onsite, Panel Round..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Candidate
                  </label>
                  <CustomSelect
                    value={schedulerData.candidate_id?.toString() ?? ''}
                    onChange={(value) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        candidate_id: value ? Number(value) : undefined,
                      }))
                    }
                    options={candidateOptions}
                    placeholder={
                      isLoadingOptions
                        ? 'Loading candidates…'
                        : 'Select candidate'
                    }
                    disabled={isLoadingOptions || candidateOptions.length === 0}
                    emptyMessage="No candidates found"
                    searchable
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Job / Requisition
                  </label>
                  <CustomSelect
                    value={schedulerData.job_id?.toString() ?? ''}
                    onChange={(value) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        job_id: value ? Number(value) : undefined,
                      }))
                    }
                    options={jobOptions}
                    placeholder={
                      isLoadingOptions ? 'Loading jobs…' : 'Select job'
                    }
                    disabled={isLoadingOptions || jobOptions.length === 0}
                    emptyMessage="No jobs found"
                    searchable
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Start Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      schedulerData.scheduled_start?.slice(0, 16) ??
                      new Date().toISOString().slice(0, 16)
                    }
                    onChange={(event) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        scheduled_start: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={schedulerData.duration_minutes}
                    onChange={(event) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        duration_minutes: Math.max(
                          15,
                          Number(event.target.value) || 60,
                        ),
                      }))
                    }
                    min={15}
                    step={15}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Timezone
                  </label>
                  <CustomSelect
                    value={
                      schedulerData.timezone ?? timezoneOptions[0]?.value ?? ''
                    }
                    onChange={(value) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        timezone: value || undefined,
                      }))
                    }
                    options={timezoneOptions}
                    placeholder="Select timezone"
                    emptyMessage="No timezones available"
                    searchable
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Meeting Link (Google Meet)
                  </label>
                  <p className="text-xs text-gray-500 border rounded-md px-3 py-2 bg-gray-50">
                    Google Meet link will be generated automatically and shared
                    with panelists after scheduling.
                  </p>
                </div>
              </div>
            )}
            {schedulerStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Notes
                  </label>
                  <Textarea
                    value={schedulerData.notes ?? ''}
                    onChange={(event) =>
                      setSchedulerData((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Share agenda, expectations, or preparation details."
                  />
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700 flex gap-2 items-center">
                      <Users2 className="h-3.5 w-3.5" />
                      Panelists
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        if (!panelistOptions.length) {
                          showToast(
                            'No users available to assign as panelists.',
                            'error',
                          );
                          return;
                        }
                        const defaultId = Number(panelistOptions[0].value) || 0;
                        setSchedulerData((prev) => ({
                          ...prev,
                          panel: [
                            ...prev.panel,
                            {
                              interviewer_id: defaultId,
                              role: 'Interviewer',
                              status: 'invited',
                            },
                          ],
                        }));
                      }}
                    >
                      Add Panelist
                    </Button>
                  </div>
                  {!panelistOptions.length && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                      No users available to assign as panelists. Configure users
                      in User Management first.
                    </p>
                  )}
                  <div className="space-y-2">
                    {schedulerData.panel.map((panelist, idx) => (
                      <div
                        key={`panel-${idx}-${panelist.interviewer_id ?? 'new'}`}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                      >
                        <CustomSelect
                          value={
                            panelist.interviewer_id
                              ? panelist.interviewer_id.toString()
                              : ''
                          }
                          onChange={(value) => {
                            const numericValue = value ? Number(value) : 0;
                            setSchedulerData((prev) => {
                              const nextPanel = [...prev.panel];
                              nextPanel[idx] = {
                                ...nextPanel[idx],
                                interviewer_id: numericValue,
                              };
                              return { ...prev, panel: nextPanel };
                            });
                          }}
                          options={panelistOptions}
                          placeholder={
                            panelistOptions.length
                              ? 'Select panelist'
                              : 'No panelists available'
                          }
                          emptyMessage="No panelists available"
                          disabled={panelistOptions.length === 0}
                          searchable
                        />
                        <Input
                          value={panelist.role ?? ''}
                          placeholder="Role (Moderator, etc.)"
                          onChange={(event) => {
                            setSchedulerData((prev) => {
                              const nextPanel = [...prev.panel];
                              nextPanel[idx] = {
                                ...nextPanel[idx],
                                role: event.target.value,
                              };
                              return { ...prev, panel: nextPanel };
                            });
                          }}
                        />
                        <CustomSelect
                          value={panelist.status ?? 'invited'}
                          options={[
                            { label: 'Invited', value: 'invited' },
                            { label: 'Confirmed', value: 'confirmed' },
                            { label: 'Declined', value: 'declined' },
                          ]}
                          onChange={(value) =>
                            setSchedulerData((prev) => {
                              const nextPanel = [...prev.panel];
                              nextPanel[idx] = {
                                ...nextPanel[idx],
                                status: value,
                              };
                              return { ...prev, panel: nextPanel };
                            })
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSchedulerData((prev) => ({
                              ...prev,
                              panel: prev.panel.filter((_, i) => i !== idx),
                            }));
                          }}
                          title="Remove panelist"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {!schedulerData.panel.length && (
                      <p className="text-[11px] text-gray-500">
                        No panelists added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSchedulerOpen(false)}
                >
                  Cancel
                </Button>
                {schedulerStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSchedulerBack}
                    disabled={isSubmittingRound}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!isLastSchedulerStep ? (
                  <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleSchedulerNext}
                    disabled={isSubmittingRound}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isSubmittingRound}
                  >
                    {isSubmittingRound ? 'Scheduling…' : 'Schedule Interview'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoundDetailOpen} onOpenChange={setIsRoundDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedRound?.round_name ?? 'Interview Round'}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full border ${statusBadgeClass(selectedRound?.status)}`}
                >
                  {selectedRound?.status?.replace('_', ' ')}
                </span>
                {selectedRound?.stage && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Target className="h-3 w-3" />
                    {selectedRound.stage}
                  </span>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedRound ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedRound.meeting_url && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleStartMeeting}
                    disabled={isUpdatingStatus}
                  >
                    Start Meeting
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleMarkCompleted}
                  disabled={isUpdatingStatus}
                >
                  Mark Completed
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Candidate</span>
                  <span className="font-medium">
                    {selectedRound.candidate_id
                      ? (candidateNameMap[selectedRound.candidate_id] ??
                        `Candidate #${selectedRound.candidate_id}`)
                      : 'Not linked'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Job ID</span>
                  <span className="font-medium">
                    {selectedRound.job_id ?? 'Not linked'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Scheduled</span>
                  <span className="font-medium">
                    {new Date(selectedRound.scheduled_start).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Duration</span>
                  <span className="font-medium">
                    {selectedRound.duration_minutes} minutes
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Timezone</span>
                  <span className="font-medium">
                    {selectedRound.timezone ?? '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Location</span>
                  <span className="font-medium">
                    {selectedRound.location ?? 'Virtual'}
                  </span>
                </div>
              </div>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    Panel
                  </span>
                  {selectedRound.meeting_url && (
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        window.open(selectedRound.meeting_url!, '_blank')
                      }
                    >
                      Join Meeting
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  {selectedRound.panel_assignments?.map((panelist) => (
                    <div
                      key={panelist.id}
                      className="flex items-center justify-between text-xs border rounded-md px-2 py-1"
                    >
                      <div>
                        <div className="font-medium">
                          {panelist.interviewer_id
                            ? (panelistNameMap[panelist.interviewer_id] ??
                              `Panelist #${panelist.interviewer_id}`)
                            : 'Panelist TBD'}
                        </div>
                        {panelist.role && (
                          <div className="text-[11px] text-gray-500">
                            Role: {panelist.role}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] ${
                          panelist.status === 'confirmed'
                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                            : panelist.status === 'declined'
                              ? 'border-rose-200 text-rose-600 bg-rose-50'
                              : 'border-gray-200 text-gray-600 bg-gray-50'
                        }`}
                      >
                        {panelist.status}
                      </span>
                    </div>
                  ))}
                  {!selectedRound.panel_assignments?.length && (
                    <p className="text-[11px] text-gray-500">
                      Panel has not been assigned yet.
                    </p>
                  )}
                </div>
              </div>
              {selectedRound.notes && (
                <div className="border rounded-lg p-3 text-sm">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Notes
                  </div>
                  <p className="text-gray-700">{selectedRound.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No round selected.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Interview Hosting Interface */}
      {isHostingInterfaceOpen && selectedRound && (
        <InterviewHosting
          round={selectedRound}
          onClose={() => {
            setIsHostingInterfaceOpen(false);
            setSelectedRound(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default InterviewsPage;
