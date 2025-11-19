import React, { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const InterviewsPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
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

  // Placeholder scheduled interviews; replace with API data later
  const interviews = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const d = (day: number) => new Date(y, m, day).toISOString().split('T')[0];
    return [
      {
        id: 1,
        name: 'Candidate Screen',
        role: 'UI/UX Designer',
        date: d(3),
        time: '10:30 - 12:00',
        status: 'Scheduled',
        start: d(3),
        end: d(3),
        priority: 'Low',
      },
      {
        id: 2,
        name: 'Portfolio Review',
        role: 'Backend Engineer',
        date: d(6),
        time: '10:30 - 12:00',
        status: 'Scheduled',
        start: d(6),
        end: d(6),
        priority: 'Medium',
      },
      {
        id: 3,
        name: 'Tech Round',
        role: 'Product Designer',
        date: d(10),
        time: '09:30 - 10:30',
        status: 'Scheduled',
        start: d(10),
        end: d(10),
        priority: 'High',
      },
      {
        id: 31,
        name: 'Tech Round 2',
        role: 'Product Designer',
        date: d(10),
        time: '11:00 - 12:00',
        status: 'Scheduled',
        start: d(10),
        end: d(10),
        priority: 'Medium',
      },
      {
        id: 32,
        name: 'Managerial Round',
        role: 'Product Designer',
        date: d(10),
        time: '02:00 - 03:00',
        status: 'Scheduled',
        start: d(10),
        end: d(10),
        priority: 'Low',
      },
      {
        id: 4,
        name: 'System Design',
        role: 'Frontend Developer',
        date: d(12),
        time: '10:30 - 12:00',
        status: 'Scheduled',
        start: d(12),
        end: d(12),
        priority: 'Medium',
      },
      {
        id: 5,
        name: 'HR Discussion',
        role: 'QA Analyst',
        date: d(18),
        time: '10:30 - 12:00',
        status: 'Scheduled',
        start: d(18),
        end: d(18),
        priority: 'Low',
      },
      {
        id: 6,
        name: 'Panel Interview',
        role: 'Backend Engineer',
        date: d(24),
        time: '10:30 - 12:00',
        status: 'Scheduled',
        start: d(24),
        end: d(24),
        priority: 'High',
      },
      {
        id: 7,
        name: 'Client Round',
        role: 'PM',
        date: d(27),
        time: '15:30 - 17:00',
        status: 'Scheduled',
        start: d(27),
        end: d(27),
        priority: 'Medium',
      },
    ];
  }, [currentMonth]);

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
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Interviews
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              Scheduled interviews overview
            </p>
          </div>
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
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 dark:bg-slate-800/80 rounded-xl p-4 shadow border border-gray-200 dark:border-white/10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Scheduled Interviews
            </h2>
            <div className="space-y-2">
              {interviews.map((i) => (
                <div
                  key={i.id}
                  className="w-full text-left bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {i.name}
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-300">
                        {i.role}
                      </div>
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
                </div>
              ))}
            </div>
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
                        navigate(`/interviews/${i.id}`);
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
    </MainLayout>
  );
};

export default InterviewsPage;
