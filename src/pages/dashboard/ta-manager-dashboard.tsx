import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  ClipboardCheck,
  Clock,
  Layers,
  Search,
  Sparkles,
  Target,
  Users,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchJobCategories, useAppDispatch, useAppSelector } from '@/store';
import type { JobCategory } from '@/store/jobCategory/types/jobCategoryTypes';

type CategorySummary = {
  id: number;
  name: string;
  openRoles: number;
  priority: 'High' | 'Medium' | 'Low';
  assignedRecruiters: number;
  agingDays: number;
  healthScore: number;
  lastUpdated: string | null;
};

type ActiveCategory = {
  category: JobCategory;
  summary: CategorySummary;
};

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ACTIVITY_TEMPLATES = [
  'Intake session completed',
  'Offer approvals pending',
  'Priority requisition created',
  'Market mapping updated',
  'Diversity slate review required',
];

const formatDate = (
  iso?: string | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!iso) {
    return 'Not available';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) {
    return 'Updated just now';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Updated just now';
  }
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return 'Updated just now';
  }
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `Updated ${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TAManagerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, isLoading, error } = useAppSelector(
    (state) => state.jobCategory,
  );

  const fallbackCategories = useMemo<JobCategory[]>(
    () => [
      {
        id: 1,
        name: 'Product & Design',
        description: 'UX, product, and design leadership roles across the org.',
        is_active: true,
        created_by: 'Harshan Palanisamy',
        created_at: '2025-10-04T11:00:00.000Z',
        updated_at: '2025-11-10T10:30:00.000Z',
      },
      {
        id: 2,
        name: 'Engineering Leadership',
        description: 'Staff+ ICs and engineering management positions.',
        is_active: true,
        created_by: 'Amelia Watts',
        created_at: '2025-09-12T08:20:00.000Z',
        updated_at: '2025-11-08T14:05:00.000Z',
      },
      {
        id: 3,
        name: 'Revenue Operations',
        description: 'Sales, success, and revenue enablement hiring tracks.',
        is_active: true,
        created_by: 'Jordan Brooks',
        created_at: '2025-10-22T15:45:00.000Z',
        updated_at: '2025-11-11T09:18:00.000Z',
      },
      {
        id: 4,
        name: 'Data & Analytics',
        description: 'BI analysts, ML engineers, and analytics leadership.',
        is_active: false,
        created_by: 'Priya Raman',
        created_at: '2025-07-02T12:30:00.000Z',
        updated_at: '2025-10-18T18:45:00.000Z',
      },
      {
        id: 5,
        name: 'People & Talent',
        description: 'Recruiting operations, employer branding, HRBP roles.',
        is_active: true,
        created_by: 'Samir Patel',
        created_at: '2025-08-14T09:00:00.000Z',
        updated_at: '2025-11-09T16:10:00.000Z',
      },
    ],
    [],
  );

  const [useSampleData, setUseSampleData] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  useEffect(() => {
    dispatch(fetchJobCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (items.length > 0) {
        setUseSampleData(false);
      } else if (error) {
        setUseSampleData(true);
      }
    }
  }, [items.length, isLoading, error]);

  const shouldUseFallback =
    useSampleData || (!isLoading && items.length === 0 && !!error);

  const categories = shouldUseFallback ? fallbackCategories : items;
  const isUsingFallback = shouldUseFallback;

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aDate = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
      const bDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
      return bDate - aDate;
    });
  }, [categories]);

  const handleRefresh = useCallback(() => {
    setUseSampleData(false);
    dispatch(fetchJobCategories());
  }, [dispatch]);

  const userName = useMemo(() => {
    if (!user) {
      return 'Manager';
    }
    const firstName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (firstName) {
      return firstName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Manager';
  }, [user]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (category) => category.is_active !== false,
  ).length;
  const inactiveCategories = totalCategories - activeCategories;
  const newThisMonth = categories.filter((category) => {
    if (!category.created_at) {
      return false;
    }
    const created = new Date(category.created_at);
    if (Number.isNaN(created.getTime())) {
      return false;
    }
    const diffDays = (Date.now() - created.getTime()) / 86400000;
    return diffDays <= 30;
  }).length;

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    return categories.map((category, index) => {
      const base =
        category.description?.length ?? category.name.length ?? index + 3;
      const openRoles = Math.max(1, (base % 8) + ((index * 3) % 4));
      const assignedRecruiters = Math.max(2, (category.name.length % 4) + 1);
      const lastUpdated = category.updated_at ?? category.created_at ?? null;
      let agingDays = 12 + index * 3;
      if (lastUpdated) {
        const updated = new Date(lastUpdated);
        if (!Number.isNaN(updated.getTime())) {
          agingDays = Math.max(
            1,
            Math.round((Date.now() - updated.getTime()) / 86400000),
          );
        }
      }
      const healthBase = 100 - agingDays + openRoles * 4;
      const healthScore = Math.min(98, Math.max(50, healthBase));
      const priority =
        openRoles >= 7 ? 'High' : openRoles >= 4 ? 'Medium' : 'Low';

      return {
        id: Number(category.id),
        name: category.name,
        openRoles,
        priority,
        assignedRecruiters,
        agingDays,
        healthScore,
        lastUpdated,
      };
    });
  }, [categories]);

  const leadCategory = useMemo(() => {
    if (!categorySummaries.length) {
      return null;
    }
    return [...categorySummaries].sort(
      (a, b) => b.openRoles - a.openRoles || a.healthScore - b.healthScore,
    )[0];
  }, [categorySummaries]);

  const coverageList = useMemo(() => {
    return [...categorySummaries]
      .sort((a, b) => b.openRoles - a.openRoles)
      .slice(0, 5);
  }, [categorySummaries]);

  const pipelineFocus = useMemo(() => {
    return [...categorySummaries]
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, 3);
  }, [categorySummaries]);

  const weeklyVelocity = useMemo(() => {
    const totals = Array(7).fill(0);
    categorySummaries.forEach((summary, index) => {
      totals[index % 7] += Math.max(
        1,
        summary.openRoles - Math.floor(summary.agingDays / 5),
      );
    });
    return totals.map((count, index) => ({
      label: weekdays[index],
      count,
    }));
  }, [categorySummaries]);

  const strategicInitiatives = useMemo(() => {
    const now = new Date();
    return pipelineFocus.map((summary, index) => {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + (index + 1) * 4);
      const status =
        index === 0 ? 'In progress' : index === 1 ? 'Scheduled' : 'Planned';
      return {
        id: summary.id,
        name: summary.name,
        openRoles: summary.openRoles,
        status,
        due: dueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  }, [pipelineFocus]);

  const recentUpdates = useMemo(() => {
    return categorySummaries.slice(0, 4).map((summary, index) => ({
      id: summary.id,
      name: summary.name,
      detail: ACTIVITY_TEMPLATES[index % ACTIVITY_TEMPLATES.length],
      timestamp: formatRelativeTime(summary.lastUpdated),
    }));
  }, [categorySummaries]);

  const monthLabel = currentMonth.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const categoryUpdateDates = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((category) => {
      const iso = category.updated_at ?? category.created_at;
      if (!iso) {
        return;
      }
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      date.setHours(0, 0, 0, 0);
      set.add(date.toDateString());
    });
    return set;
  }, [categories]);

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

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleOpenCategory = (categoryId: number) => {
    const category = categories.find(
      (item) => Number(item.id) === Number(categoryId),
    );
    const summary = categorySummaries.find(
      (item) => Number(item.id) === Number(categoryId),
    );
    if (category && summary) {
      setActiveCategory({ category, summary });
      setIsDetailOpen(true);
    }
  };

  const highlightCards = useMemo(
    () => [
      {
        id: 'categories',
        title: 'Job categories',
        metric: isLoading
          ? 'Loading…'
          : `${totalCategories} tracked${isUsingFallback ? ' (sample)' : ''}`,
        caption: isUsingFallback
          ? 'Showing sample framework'
          : 'All hiring streams',
        icon: Layers,
        accent: 'bg-blue-100 text-blue-500',
        rate: isLoading
          ? 'Syncing'
          : isUsingFallback
            ? 'Sample data'
            : 'Live data',
        type: 'Coverage',
      },
      {
        id: 'active',
        title: 'Active coverage',
        metric: isLoading ? 'Loading…' : `${activeCategories} active`,
        caption: 'Ready for intake support',
        icon: Users,
        accent: 'bg-emerald-100 text-emerald-500',
        rate: isLoading
          ? 'Syncing'
          : `${Math.round(
              (activeCategories / Math.max(totalCategories, 1)) * 100,
            )}% coverage`,
        type: 'Status',
      },
      {
        id: 'new',
        title: 'New this month',
        metric: isLoading ? 'Loading…' : `${newThisMonth} added`,
        caption: 'Emerging hiring streams',
        icon: Sparkles,
        accent: 'bg-purple-100 text-purple-500',
        rate: isLoading
          ? 'Syncing'
          : newThisMonth
            ? 'Growing intake'
            : 'Review upcoming',
        type: 'Trend',
      },
      {
        id: 'inactive',
        title: 'Needs attention',
        metric: isLoading ? 'Loading…' : `${inactiveCategories} inactive`,
        caption: 'Revisit ownership & demand',
        icon: ClipboardCheck,
        accent: 'bg-amber-100 text-amber-600',
        rate: isLoading
          ? 'Syncing'
          : inactiveCategories
            ? 'Follow up'
            : 'All clear',
        type: 'Next steps',
      },
    ],
    [
      activeCategories,
      inactiveCategories,
      isLoading,
      isUsingFallback,
      newThisMonth,
      totalCategories,
    ],
  );

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
            Oversee hiring streams, unblock recruiters, and keep intake aligned
            with demand.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <Search className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search categories"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Priority focus
            </p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {isLoading
                ? 'Loading category insights…'
                : leadCategory
                  ? `${leadCategory.name} • ${leadCategory.openRoles} open roles`
                  : isUsingFallback
                    ? 'No live categories configured'
                    : 'Align with recruiters to define new intake'}
            </h2>
            {leadCategory && !isLoading && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {leadCategory.priority} priority •{' '}
                {leadCategory.assignedRecruiters} recruiters assigned •{' '}
                {formatRelativeTime(leadCategory.lastUpdated)}
              </p>
            )}
            {!leadCategory && !isLoading && (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {isUsingFallback
                  ? 'Showing sample framework until live data syncs.'
                  : 'Create your first job category to organize requisitions.'}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            {leadCategory && (
              <Button
                size="sm"
                className="h-8 rounded-2xl bg-purple-600 px-3 text-xs font-semibold text-white shadow hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                onClick={() => handleOpenCategory(leadCategory.id)}
              >
                <Briefcase className="h-3 w-3" /> View plan
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-2xl border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={() =>
                leadCategory && handleOpenCategory(leadCategory.id)
              }
              disabled={!leadCategory}
            >
              <Target className="h-3 w-3" /> Category brief
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Quick insights
          </h2>
          <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-200">
            {isUsingFallback ? 'Sample preview' : 'Live operations'}
          </span>
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

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Category directory
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isUsingFallback
                ? 'Showing sample categories until the API responds.'
                : 'Live list of job categories with their latest status.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isUsingFallback && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                Sample data
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-2xl border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs text-gray-600 dark:divide-slate-800 dark:text-gray-300">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500 dark:bg-slate-900/70 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Created by</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {sortedCategories.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No job categories found. Create one from the job categories
                    workspace to see it here.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Syncing categories…
                  </td>
                </tr>
              )}
              {!isLoading &&
                sortedCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {category.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          category.is_active !== false
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                            : 'bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                        }`}
                      >
                        {category.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {category.created_by ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(category.created_at, {
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatRelativeTime(category.updated_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Hiring velocity
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-emerald-500">
                    {isUsingFallback ? '+4% vs. sample' : '+6% vs. last week'}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                  Weekly
                </span>
              </div>
              <div className="mt-5 grid h-40 grid-cols-7 items-end gap-2">
                {weeklyVelocity.map((entry) => (
                  <div
                    key={entry.label}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-3 rounded-full bg-indigo-400 transition-all dark:bg-indigo-500"
                      style={{ height: `${Math.max(entry.count * 18, 6)}px` }}
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
                  Category coverage
                </h3>
                <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                  View board <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {isLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Syncing category metrics…
                  </p>
                )}
                {!isLoading && coverageList.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isUsingFallback
                      ? 'No categories available in sample data.'
                      : 'Create categories to track hiring demand.'}
                  </p>
                )}
                {!isLoading &&
                  coverageList.map((summary) => (
                    <button
                      key={summary.id}
                      onClick={() => handleOpenCategory(summary.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-3.5 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                          {summary.name
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {summary.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {summary.openRoles} open roles • {summary.priority}{' '}
                            priority
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {`${summary.agingDays}d`}
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
                  Category health overview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Balance recruiter bandwidth across demand spikes.
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                Insights <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {pipelineFocus.map((summary) => (
                <div
                  key={summary.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {summary.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {summary.openRoles} roles • {summary.assignedRecruiters}{' '}
                      recruiters
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${summary.healthScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-200">
                      {summary.healthScore}%
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
                  Enablement
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                  Run intake and prioritization playbooks
                </h3>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Align your managers and recruiters with ready-to-use intake
                  templates, scorecards, and calibration checklists.
                </p>
              </div>
              <div className="hidden sm:block h-16 w-16 rounded-full bg-purple-100/80 dark:bg-indigo-500/20" />
            </div>
            <Button className="mt-3 h-8 w-full rounded-2xl bg-purple-600 text-xs font-semibold text-white hover:bg-purple-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
              Download playbook
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
              {weekdays.map((day) => (
                <span key={day}>{day.charAt(0)}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5 text-xs">
              {calendarCells.map((cell) => {
                const cellDate = cell.date.toDateString();
                const hasUpdate = categoryUpdateDates.has(cellDate);
                const today = new Date();
                const isToday =
                  cell.date.getFullYear() === today.getFullYear() &&
                  cell.date.getMonth() === today.getMonth() &&
                  cell.date.getDate() === today.getDate();
                return (
                  <button
                    key={cell.key}
                    className={`flex h-9 items-center justify-center rounded-xl border text-xs transition ${
                      cell.isCurrent
                        ? 'border-transparent bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200'
                        : 'border-transparent text-gray-400 dark:text-gray-500'
                    } ${hasUpdate ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''} ${
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
                Team actions
              </h3>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-200">
                Assign <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {strategicInitiatives.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isLoading
                    ? 'Syncing initiatives…'
                    : 'No actions pending. Align with hiring managers for upcoming demand.'}
                </p>
              )}
              {strategicInitiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {initiative.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {initiative.openRoles} open roles • Due {initiative.due}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      initiative.status === 'In progress'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200'
                        : initiative.status === 'Scheduled'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200'
                    }`}
                  >
                    {initiative.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Recent updates
          </h3>
          <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-200">
            {isUsingFallback ? 'Sample timeline' : 'Live adjustments'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recentUpdates.map((update) => (
            <div
              key={update.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200">
                {update.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {update.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {update.detail}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {update.timestamp}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Dialog
        open={isDetailOpen && !!activeCategory}
        onOpenChange={setIsDetailOpen}
      >
        <DialogContent className="max-w-2xl bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100">
          {activeCategory && (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {activeCategory.category.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {activeCategory.summary.openRoles} open roles •{' '}
                  {activeCategory.summary.priority} priority stream
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                {activeCategory.category.description && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-300">
                    {activeCategory.category.description}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Pipeline snapshot
                    </p>
                    <ul className="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <li>
                        • {activeCategory.summary.openRoles} active openings
                      </li>
                      <li>
                        • {activeCategory.summary.assignedRecruiters} recruiters
                        assigned
                      </li>
                      <li>• Aging {activeCategory.summary.agingDays} days</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Key details
                    </p>
                    <ul className="mt-2 space-y-2 text-xs">
                      <li>
                        • Status:{' '}
                        {activeCategory.category.is_active !== false
                          ? 'Active'
                          : 'Inactive'}
                      </li>
                      <li>
                        • Created by:{' '}
                        {activeCategory.category.created_by ?? 'Unknown owner'}
                      </li>
                      <li>
                        • Created:{' '}
                        {formatDate(activeCategory.category.created_at)}
                      </li>
                      <li>
                        • Updated:{' '}
                        {formatRelativeTime(activeCategory.category.updated_at)}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailOpen(false)}
                    className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                  >
                    Share with recruiting
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

export default TAManagerDashboard;
