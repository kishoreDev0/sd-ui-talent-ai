import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Mail, Phone, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Candidate {
  id: number;
  name: string;
  position: string;
  experience: string;
  skills: string[];
  avatar: string;
  status:
    | 'applied'
    | 'screening'
    | 'interview_scheduled'
    | 'feedback_pending'
    | 'selected'
    | 'rejected';
  interviewDate?: string;
  interviewTime?: string;
  matchScore?: number;
  email: string;
  phone: string;
}

// Simplified dashboard: no internal sidebar or kanban

const InterviewerDashboard: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [candidates] = useState<Candidate[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Product Designer',
      experience: '5 years',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems'],
      avatar: 'SJ',
      status: 'applied',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      matchScore: 92,
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Frontend Developer',
      experience: '3 years',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      avatar: 'MC',
      status: 'screening',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Emily Davis',
      position: 'UI/UX Designer',
      experience: '4 years',
      skills: ['Sketch', 'Figma', 'Adobe XD', 'User Research'],
      avatar: 'ED',
      status: 'interview_scheduled',
      interviewDate: '2024-01-28',
      interviewTime: '10:00 AM',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 345-6789',
      matchScore: 85,
    },
    {
      id: 4,
      name: 'David Park',
      position: 'Backend Engineer',
      experience: '6 years',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      avatar: 'DP',
      status: 'interview_scheduled',
      interviewDate: '2024-01-29',
      interviewTime: '2:00 PM',
      email: 'david.park@email.com',
      phone: '+1 (555) 456-7890',
      matchScore: 90,
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      position: 'Full Stack Developer',
      experience: '4 years',
      skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
      avatar: 'JM',
      status: 'feedback_pending',
      interviewDate: '2024-01-25',
      interviewTime: '11:00 AM',
      email: 'jessica.martinez@email.com',
      phone: '+1 (555) 567-8901',
      matchScore: 87,
    },
    {
      id: 6,
      name: 'Robert Wilson',
      position: 'DevOps Engineer',
      experience: '5 years',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      avatar: 'RW',
      status: 'selected',
      email: 'robert.wilson@email.com',
      phone: '+1 (555) 678-9012',
      matchScore: 95,
    },
    {
      id: 7,
      name: 'Lisa Anderson',
      position: 'Product Manager',
      experience: '7 years',
      skills: ['Agile', 'Product Strategy', 'Analytics', 'User Research'],
      avatar: 'LA',
      status: 'rejected',
      email: 'lisa.anderson@email.com',
      phone: '+1 (555) 789-0123',
      matchScore: 75,
    },
  ]);

  const scheduledInterviews = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const dayIso = (d: number) => new Date(y, m, d).toISOString().split('T')[0];
    const timeSlots = [
      '09:30 AM',
      '11:00 AM',
      '02:00 PM',
      '03:30 PM',
      '05:00 PM',
    ];
    const onlyScheduled = candidates.filter(
      (c) => c.status === 'interview_scheduled',
    );

    // Ensure exactly 3 interviews on the 10th
    const first = onlyScheduled[0] || candidates[0];
    const second = onlyScheduled[1] || candidates[1] || first;
    const third = onlyScheduled[2] || candidates[2] || first;
    const fixedTenth = [first, second, third].map((c, i) => ({
      ...c,
      id: Number(`${c.id}${i}`),
      interviewDate: dayIso(10),
      interviewTime: timeSlots[i],
    }));

    // Distribute remaining across other days
    const baseDays = [3, 6, 12, 18, 18, 24, 24, 27];
    const rest = onlyScheduled.slice(3);
    const distributed = rest.map((c, idx) => ({
      ...c,
      interviewDate: dayIso(baseDays[idx % baseDays.length]),
      interviewTime: timeSlots[(idx + 3) % timeSlots.length],
    }));

    return [...fixedTenth, ...distributed];
  }, [candidates]);
  const interviewsCount = scheduledInterviews.length;

  const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, delta: number) =>
    new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const getMonthMatrix = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDay = (start.getDay() + 6) % 7; // make Monday=0
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
    // Expected formats like '09:30 AM' or '2:00 PM'
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const mer = match[3].toUpperCase();
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  // Timeline helpers removed (timeline view deprecated)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-6"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-white/10 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Interviews
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Assigned to you
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                <Calendar className="w-5 h-5" />
                <span className="text-xl font-semibold">{interviewsCount}</span>
              </div>
              <div className="mt-6 inline-flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 text-sm ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-white/10">
              {viewMode === 'list' ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Scheduled Interviews
                  </h2>
                  {scheduledInterviews.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                      No scheduled interviews
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduledInterviews.map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setIsDetailModalOpen(true);
                          }}
                          className="w-full text-left bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-white/10 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                {candidate.avatar}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {candidate.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  {candidate.position}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                              <span>
                                {candidate.interviewDate
                                  ? new Date(
                                      candidate.interviewDate,
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : ''}
                                {candidate.interviewTime
                                  ? ` at ${candidate.interviewTime}`
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Interview Calendar
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentMonth(addMonths(currentMonth, -1))
                        }
                        className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm"
                      >
                        Prev
                      </button>
                      <div className="px-2 text-sm text-gray-700 dark:text-gray-200">
                        {currentMonth.toLocaleString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentMonth(addMonths(currentMonth, 1))
                        }
                        className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                      (d) => (
                        <div key={d} className="p-2 text-center">
                          {d}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {getMonthMatrix(currentMonth).map((cell, idx) => {
                      const dayEvents = cell.date
                        ? scheduledInterviews.filter(
                            (c) =>
                              c.interviewDate &&
                              new Date(c.interviewDate).toDateString() ===
                                cell.date!.toDateString(),
                          )
                        : [];
                      return (
                        <div
                          key={idx}
                          className={`min-h-32 rounded-lg border border-gray-200 dark:border-white/10 p-2 ${cell.d ? 'bg-white/70 dark:bg-slate-900/40' : 'bg-transparent'}`}
                        >
                          <div className="text-right text-[10px] text-gray-500 dark:text-gray-400">
                            {cell.d || ''}
                          </div>
                          <div className="space-y-1 mt-1 max-h-24 overflow-y-auto pr-1">
                            {dayEvents.map((ev) => (
                              <button
                                key={`${ev.id}-${ev.interviewTime}`}
                                onClick={() => {
                                  setSelectedDay(
                                    ev.interviewDate
                                      ? new Date(ev.interviewDate)
                                      : null,
                                  );
                                  setIsDayModalOpen(true);
                                }}
                                className="w-full text-left text-[11px] px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition truncate"
                              >
                                {ev.name}{' '}
                                {ev.interviewTime
                                  ? `• ${ev.interviewTime}`
                                  : ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Candidate Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedCandidate.avatar}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">
                      {selectedCandidate.name}
                    </DialogTitle>
                    <p className="text-gray-600 mt-1">
                      {selectedCandidate.position}
                    </p>
                  </div>
                  {/* Status badge removed in simplified view */}
                </div>
              </DialogHeader>

              <DialogDescription>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Experience
                    </h3>
                    <p className="text-gray-600">
                      {selectedCandidate.experience}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Contact
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedCandidate.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">
                            {selectedCandidate.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedCandidate.interviewDate && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Interview
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(
                                selectedCandidate.interviewDate,
                              ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {selectedCandidate.interviewTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCandidate.matchScore && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Match Score
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                          style={{ width: `${selectedCandidate.matchScore}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCandidate.matchScore}% match with job
                        requirements
                      </p>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Day Schedule Modal */}
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
            {scheduledInterviews
              .filter(
                (c) =>
                  selectedDay &&
                  c.interviewDate &&
                  new Date(c.interviewDate).toDateString() ===
                    selectedDay.toDateString(),
              )
              .sort(
                (a, b) =>
                  parseTimeToMinutes(a.interviewTime) -
                  parseTimeToMinutes(b.interviewTime),
              )
              .map((c) => (
                <div
                  key={`${c.id}-${c.interviewTime}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {c.position}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200 mt-1">
                      <Clock className="w-3 h-3" /> {c.interviewTime}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      window.open(`https://meet.example.com/${c.id}`, '_blank')
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                  >
                    <Play className="w-4 h-4" /> Join
                  </button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* Feedback and add candidate modals removed for simplified view */}
    </div>
  );
};

export default InterviewerDashboard;
