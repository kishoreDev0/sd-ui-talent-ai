import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomSelect from '@/components/ui/custom-select';
import {
  Plus,
  Search,
  MapPin,
  CheckCircle,
  DollarSign,
  Upload,
  Download,
  Loader2,
  Bookmark,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useAppDispatch, useAppSelector, fetchJobsAsync } from '@/store';

const stripHtml = (value?: string | null) =>
  value ? value.replace(/<[^>]+>/g, '') : '';

const getCreatorLabel = (createdBy?: number | null) =>
  createdBy ? `User #${createdBy}` : 'System';

const getPriorityTheme = (
  priority?: string | null,
): { chip: string; badge: string; accent: string } => {
  const normalized = priority?.toLowerCase();
  switch (normalized) {
    case 'high':
      return {
        chip: 'bg-orange-50 text-orange-600',
        badge: 'text-orange-600',
        accent: 'ring-1 ring-orange-100',
      };
    case 'medium':
      return {
        chip: 'bg-amber-50 text-amber-600',
        badge: 'text-amber-600',
        accent: 'ring-1 ring-amber-100',
      };
    case 'low':
      return {
        chip: 'bg-emerald-50 text-emerald-600',
        badge: 'text-emerald-600',
        accent: 'ring-1 ring-emerald-100',
      };
    default:
      return {
        chip: 'bg-slate-100 text-slate-600',
        badge: 'text-slate-500',
        accent: 'ring-1 ring-transparent',
      };
  }
};

const getDaysLeftLabel = (iso?: string | null) => {
  if (!iso) {
    return '30 days left to apply';
  }
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) {
    return '30 days left to apply';
  }
  const now = new Date();
  const diffMs = created.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return 'Apply now';
  }
  if (diffDays === 1) {
    return '1 day left';
  }
  return `${diffDays} days left`;
};

const formatSalary = (
  currency?: string | null,
  from?: number | null,
  to?: number | null,
) => {
  if (from == null && to == null) {
    return 'Salary not disclosed';
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  });
  if (from != null && to != null) {
    return `${formatter.format(from)} - ${formatter.format(to)} / month`;
  }
  if (from != null) {
    return `Starts at ${formatter.format(from)} / month`;
  }
  return `Up to ${formatter.format(to as number)} / month`;
};

const getAvatarSource = (name?: string | null) => {
  if (!name) {
    return {
      initials: '?',
      color: 'bg-amber-100 text-amber-700',
    };
  }
  const colors = [
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
  ];
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  const parts = name.split(' ');
  const initials =
    parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  return {
    initials,
    color: `${colors[index].bg} ${colors[index].text}`,
  };
};

const JobBoard: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const {
    items: jobItems,
    isLoading,
    error,
    categories,
    jobTypes,
  } = useAppSelector((state) => state.job);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [jobTitle, setJobTitle] = useState('');
  const [majorSkills, setMajorSkills] = useState('');
  const [minCompensation, setMinCompensation] = useState('');
  const [maxCompensation, setMaxCompensation] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [experienceFilters, setExperienceFilters] = useState({
    entry: false,
    intermediate: false,
    expert: false,
  });
  const [jobTypeFilters, setJobTypeFilters] = useState({
    full_time: false,
    part_time: false,
    remote: false,
    freelance: false,
  });
  const [companyLevelFilters, setCompanyLevelFilters] = useState({
    c_level: false,
    senior: false,
    manager: false,
    director: false,
  });
  const [priority, setPriority] = useState({
    high: false,
    medium: false,
    low: false,
  });
  const [selectedCreator, setSelectedCreator] = useState('');

  useEffect(() => {
    dispatch(fetchJobsAsync(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const organizationOptions = useMemo(() => {
    const unique = new Set<string>();
    jobItems.forEach((job) => {
      if (job.organization) {
        unique.add(job.organization);
      }
    });
    return Array.from(unique);
  }, [jobItems]);

  const categoryBuckets = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((bucket) => ({
        name: bucket.name,
        count: bucket.count,
      }));
    }
    const counts = new Map<string, number>();
    jobItems.forEach((job) => {
      if (job.job_category) {
        const current = counts.get(job.job_category) ?? 0;
        counts.set(job.job_category, current + 1);
      }
    });
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [categories, jobItems]);

  const jobTypeBuckets = useMemo<
    Array<{
      key: keyof typeof jobTypeFilters;
      label: string;
      count: number | null;
    }>
  >(() => {
    const normalizeKey = (
      value: string,
    ): 'full_time' | 'part_time' | 'remote' | 'freelance' => {
      const lower = value.toLowerCase();
      if (lower.includes('part')) return 'part_time';
      if (lower.includes('contract') || lower.includes('freelance'))
        return 'freelance';
      if (lower.includes('remote') || lower.includes('temp')) return 'remote';
      return 'full_time';
    };

    if (jobTypes.length > 0) {
      return jobTypes.map((bucket) => ({
        key: normalizeKey(bucket.name),
        label: bucket.name,
        count: bucket.count ?? null,
      }));
    }

    const counts: Record<
      'full_time' | 'part_time' | 'remote' | 'freelance',
      number
    > = {
      full_time: 0,
      part_time: 0,
      remote: 0,
      freelance: 0,
    };

    jobItems.forEach((job) => {
      if (job.employment_type) {
        const key = normalizeKey(job.employment_type);
        counts[key] += 1;
      }
    });

    return [
      { key: 'full_time', label: 'Full Time', count: counts.full_time },
      { key: 'part_time', label: 'Part Time', count: counts.part_time },
      { key: 'remote', label: 'Temporary', count: counts.remote },
      { key: 'freelance', label: 'Contractor', count: counts.freelance },
    ];
  }, [jobTypes, jobItems]);

  const experienceCounts = useMemo(() => {
    const counts = { entry: 0, intermediate: 0, expert: 0 };
    jobItems.forEach((job) => {
      const level = (job.level ?? '').toLowerCase();
      if (level.includes('entry') || level.includes('junior')) {
        counts.entry += 1;
      } else if (level.includes('senior') || level.includes('lead')) {
        counts.expert += 1;
      } else if (level.includes('mid') || level.includes('intermediate')) {
        counts.intermediate += 1;
      }
    });
    return counts;
  }, [jobItems]);

  const companyLevelCounts = useMemo(() => {
    const counts = { c_level: 0, senior: 0, manager: 0, director: 0 };
    jobItems.forEach((job) => {
      const level = (job.level ?? '').toLowerCase();
      if (level.includes('c-level') || level.includes('executive')) {
        counts.c_level += 1;
      }
      if (level.includes('senior')) {
        counts.senior += 1;
      }
      if (level.includes('manager')) {
        counts.manager += 1;
      }
      if (level.includes('director')) {
        counts.director += 1;
      }
    });
    return counts;
  }, [jobItems]);

  const creatorOptions = useMemo(() => {
    const unique = new Set<string>();
    jobItems.forEach((job) => {
      unique.add(getCreatorLabel(job.created_by));
    });
    return Array.from(unique);
  }, [jobItems]);

  const handlePriorityToggle = (level: 'high' | 'medium' | 'low') => {
    setPriority((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleExperienceToggle = (
    level: 'entry' | 'intermediate' | 'expert',
  ) => {
    setExperienceFilters((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleJobTypeToggle = (
    type: 'full_time' | 'part_time' | 'remote' | 'freelance',
  ) => {
    setJobTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleCompanyLevelToggle = (
    level: 'c_level' | 'senior' | 'manager' | 'director',
  ) => {
    setCompanyLevelFilters((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleCategoryToggle = (name: string) => {
    setSelectedCategory((prev) => (prev === name ? '' : name));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('Newest');
    setJobTitle('');
    setMajorSkills('');
    setMinCompensation('');
    setMaxCompensation('');
    setSelectedOrganization('');
    setSelectedCategory('');
    setExperienceFilters({
      entry: false,
      intermediate: false,
      expert: false,
    });
    setJobTypeFilters({
      full_time: false,
      part_time: false,
      remote: false,
      freelance: false,
    });
    setCompanyLevelFilters({
      c_level: false,
      senior: false,
      manager: false,
      director: false,
    });
    setPriority({
      high: false,
      medium: false,
      low: false,
    });
    setSelectedCreator('');
  };

  const toNumberSafe = (value: string) => {
    if (!value || value.trim() === '') {
      return null;
    }
    const sanitized = value.replace(/[^0-9.]/g, '');
    if (sanitized.trim() === '') {
      return null;
    }
    const parsed = Number(sanitized);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const filteredJobs = useMemo(() => {
    let result = [...jobItems];

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      result = result.filter((job) => {
        const combined = [
          job.job_title,
          job.organization,
          job.job_category,
          stripHtml(job.job_description),
        ]
          .join(' ')
          .toLowerCase();
        return combined.includes(search);
      });
    }

    if (jobTitle.trim()) {
      const term = jobTitle.trim().toLowerCase();
      result = result.filter(
        (job) =>
          job.job_title.toLowerCase().includes(term) ||
          stripHtml(job.job_description).toLowerCase().includes(term),
      );
    }

    if (majorSkills.trim()) {
      const term = majorSkills.trim().toLowerCase();
      result = result.filter(
        (job) =>
          job.major_skills.some((skill) =>
            skill.name.toLowerCase().includes(term),
          ) ||
          job.skills.some((skill) => skill.name.toLowerCase().includes(term)),
      );
    }

    if (selectedOrganization) {
      result = result.filter(
        (job) => job.organization === selectedOrganization,
      );
    }

    if (selectedCategory) {
      result = result.filter((job) => job.job_category === selectedCategory);
    }

    if (selectedCreator) {
      result = result.filter(
        (job) => getCreatorLabel(job.created_by) === selectedCreator,
      );
    }

    const activeExperience = Object.entries(experienceFilters)
      .filter(([, value]) => value)
      .map(([key]) => key);
    if (activeExperience.length > 0) {
      result = result.filter((job) => {
        const level = (job.level ?? '').toLowerCase();
        if (!level) return false;
        return (
          (experienceFilters.entry && level.includes('entry')) ||
          (experienceFilters.intermediate &&
            (level.includes('intermediate') || level.includes('mid'))) ||
          (experienceFilters.expert &&
            (level.includes('senior') || level.includes('expert')))
        );
      });
    }

    const activeJobTypes = Object.entries(jobTypeFilters).filter(
      ([, value]) => value,
    );
    if (activeJobTypes.length > 0) {
      result = result.filter((job) => {
        const type = (job.employment_type ?? '').toLowerCase();
        const level = (job.level ?? '').toLowerCase();
        return (
          (jobTypeFilters.full_time && type.includes('full')) ||
          (jobTypeFilters.part_time && type.includes('part')) ||
          (jobTypeFilters.remote &&
            (type.includes('remote') || level.includes('remote'))) ||
          (jobTypeFilters.freelance && type.includes('contract'))
        );
      });
    }

    const activeCompanyLevels = Object.entries(companyLevelFilters).filter(
      ([, value]) => value,
    );
    if (activeCompanyLevels.length > 0) {
      result = result.filter((job) => {
        const level = (job.level ?? '').toLowerCase();
        return (
          (companyLevelFilters.c_level &&
            (level.includes('c-level') || level.includes('executive'))) ||
          (companyLevelFilters.senior && level.includes('senior')) ||
          (companyLevelFilters.manager && level.includes('manager')) ||
          (companyLevelFilters.director && level.includes('director'))
        );
      });
    }

    const minComp = toNumberSafe(minCompensation);
    if (minComp != null) {
      result = result.filter((job) => {
        if (job.compensation_from != null) {
          return job.compensation_from >= minComp;
        }
        if (job.compensation_to != null) {
          return job.compensation_to >= minComp;
        }
        return false;
      });
    }

    const maxComp = toNumberSafe(maxCompensation);
    if (maxComp != null) {
      result = result.filter((job) => {
        if (job.compensation_to != null) {
          return job.compensation_to <= maxComp;
        }
        if (job.compensation_from != null) {
          return job.compensation_from <= maxComp;
        }
        return false;
      });
    }

    const priorityFilters = Object.entries(priority).filter(
      ([, value]) => value,
    );
    if (priorityFilters.length > 0) {
      result = result.filter((job) =>
        priorityFilters.some(
          ([level]) => job.priority?.toLowerCase() === level,
        ),
      );
    }

    switch (sortBy) {
      case 'Oldest':
        result.sort((a, b) => {
          const aDate = new Date(a.created_at ?? 0).getTime();
          const bDate = new Date(b.created_at ?? 0).getTime();
          return aDate - bDate;
        });
        break;
      case 'Applicants High':
        result.sort((a, b) => (b.no_of_vacancy ?? 0) - (a.no_of_vacancy ?? 0));
        break;
      case 'Applicants Low':
        result.sort((a, b) => (a.no_of_vacancy ?? 0) - (b.no_of_vacancy ?? 0));
        break;
      default:
        result.sort((a, b) => {
          const aDate = new Date(a.created_at ?? 0).getTime();
          const bDate = new Date(b.created_at ?? 0).getTime();
          return bDate - aDate;
        });
        break;
    }

    return result;
  }, [
    jobItems,
    searchTerm,
    jobTitle,
    majorSkills,
    selectedOrganization,
    selectedCategory,
    priority,
    selectedCreator,
    minCompensation,
    maxCompensation,
    sortBy,
    experienceFilters,
    jobTypeFilters,
    companyLevelFilters,
  ]);

  return (
    <MainLayout role={role}>
      <div className="space-y-6 pb-8">
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 md:px-5">
          <header className="flex flex-col gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  Find Your Dream Jobs
                </h1>
                <p className="text-sm text-slate-600">
                  Search and explore thousands of openings to land your next
                  opportunity.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="rounded-xl bg-[#4F39F6] px-4 text-sm font-semibold text-white hover:bg-[#3D2DC4]"
                  onClick={() => navigate('/register-job')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => navigate('/upload-jobs')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Jobs
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>
                  <span className="text-base font-semibold text-slate-900">
                    {filteredJobs.length}
                  </span>{' '}
                  job{filteredJobs.length === 1 ? '' : 's'} found
                </span>
                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { label: 'Newest', value: 'Newest' },
                    { label: 'Oldest', value: 'Oldest' },
                    {
                      label: 'Applicants (High to Low)',
                      value: 'Applicants High',
                    },
                    {
                      label: 'Applicants (Low to High)',
                      value: 'Applicants Low',
                    },
                  ]}
                  className="w-40"
                />
              </div>
              <form
                className="flex w-full gap-2 md:w-auto"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-xl border border-slate-200 pl-10 text-sm focus:border-[#4F39F6] focus:ring-[#4F39F6]"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Job title or keywords"
                  />
                </div>
                <Button className="h-11 rounded-xl bg-[#16a34a] px-6 text-sm font-semibold text-white hover:bg-[#15803d]">
                  Search
                </Button>
              </form>
            </div>
          </header>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 md:px-5 lg:flex-row">
          <div className="flex-1 space-y-3">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-[#4F39F6]" />
                <span className="ml-2 text-sm text-gray-600">
                  Loading jobs...
                </span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
                <Bookmark className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    No jobs available yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Create your first job posting to start building your
                    pipeline.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/register-job')}
                  className="rounded-xl bg-[#4F39F6] hover:bg-[#3D2DC4]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const theme = getPriorityTheme(job.priority);
                  const salaryLabel = formatSalary(
                    job.currency,
                    job.compensation_from,
                    job.compensation_to,
                  );
                  const daysLeftLabel = getDaysLeftLabel(job.created_at);
                  const remoteLabel = job.employment_type || 'Remote';
                  const locationLabel =
                    job.level || job.organization || 'Remote friendly';
                  const avatar = getAvatarSource(
                    job.job_title ?? job.organization ?? '',
                  );
                  const avatarLetter =
                    (job.job_title || '?').trim().charAt(0).toUpperCase() ||
                    avatar.initials.charAt(0);

                  return (
                    <motion.article
                      key={job.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold shadow-sm ring-1 ring-slate-200 ${avatar.color}`}
                        >
                          {avatarLetter}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {job.job_title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              by{' '}
                              <span className="text-emerald-600">
                                {job.organization || 'Unassigned'}
                              </span>{' '}
                              in{' '}
                              <span className="text-emerald-600">
                                {job.job_category || 'General'}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-purple-600">
                              {remoteLabel}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600">
                              <MapPin className="h-3 w-3" />
                              {locationLabel}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600">
                              <DollarSign className="h-3 w-3" />
                              {salaryLabel}
                            </span>
                            {job.priority && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.chip}`}
                              >
                                <CheckCircle className="h-3 w-3" />
                                {job.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-auto flex flex-col items-end gap-2 text-xs text-slate-500">
                          <span className="text-sm font-medium text-emerald-600">
                            {daysLeftLabel}
                          </span>
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 p-1.5 text-slate-400 transition hover:text-slate-700"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Filter</h2>
                <button
                  type="button"
                  className="text-xs font-medium text-[#4F39F6] hover:underline"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6 text-sm">
                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Job Type
                  </p>
                  {jobTypeBuckets.map((option) => (
                    <label
                      key={`${option.key}-${option.label}`}
                      className="flex items-center justify-between gap-3 text-slate-600"
                    >
                      <span className="flex-1">
                        {option.label
                          .split(' ')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ')}
                      </span>
                      {option.count != null && option.count > 0 && (
                        <span className="text-xs text-slate-400">
                          {option.count}
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={jobTypeFilters[option.key]}
                        onChange={() => handleJobTypeToggle(option.key)}
                        className="h-4 w-4 rounded border-slate-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                      />
                    </label>
                  ))}
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Experience Level
                  </p>
                  {(
                    [
                      { label: '0-1 Years', key: 'entry' as const },
                      { label: '1-2 Years', key: 'intermediate' as const },
                      { label: '3-4 Years', key: 'expert' as const },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={experienceFilters[option.key]}
                        onChange={() => handleExperienceToggle(option.key)}
                        className="h-4 w-4 rounded border-slate-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                      />
                      <span className="flex-1">{option.label}</span>
                      {experienceCounts[option.key] > 0 && (
                        <span className="text-xs text-slate-400">
                          {experienceCounts[option.key]}
                        </span>
                      )}
                    </label>
                  ))}
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Company Level
                  </p>
                  {(
                    [
                      { label: 'C Level', key: 'c_level' as const },
                      { label: 'Senior', key: 'senior' as const },
                      { label: 'Manager', key: 'manager' as const },
                      { label: 'Director', key: 'director' as const },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={companyLevelFilters[option.key]}
                        onChange={() => handleCompanyLevelToggle(option.key)}
                        className="h-4 w-4 rounded border-slate-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                      />
                      <span className="flex-1">{option.label}</span>
                      {companyLevelCounts[option.key] > 0 && (
                        <span className="text-xs text-slate-400">
                          {companyLevelCounts[option.key]}
                        </span>
                      )}
                    </label>
                  ))}
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Salary
                  </p>
                  <div className="flex items-center gap-3">
                    <Input
                      value={minCompensation}
                      onChange={(event) =>
                        setMinCompensation(event.target.value)
                      }
                      placeholder="Min"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-[#4F39F6] focus:ring-[#4F39F6]"
                    />
                    <Input
                      value={maxCompensation}
                      onChange={(event) =>
                        setMaxCompensation(event.target.value)
                      }
                      placeholder="Max"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-[#4F39F6] focus:ring-[#4F39F6]"
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Categories
                  </p>
                  {categoryBuckets.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No categories available
                    </p>
                  ) : (
                    categoryBuckets.slice(0, 6).map((bucket) => (
                      <label
                        key={bucket.name}
                        className="flex items-center justify-between gap-3 text-slate-600"
                      >
                        <span className="flex-1">
                          {bucket.name
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(' ')}
                        </span>
                        {bucket.count > 0 && (
                          <span className="text-xs text-slate-400">
                            {bucket.count}
                          </span>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedCategory === bucket.name}
                          onChange={() => handleCategoryToggle(bucket.name)}
                          className="h-4 w-4 rounded border-slate-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                        />
                      </label>
                    ))
                  )}
                </section>

                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Organization
                  </p>
                  <CustomSelect
                    value={selectedOrganization}
                    onChange={setSelectedOrganization}
                    options={organizationOptions.map((org) => ({
                      label: org,
                      value: org,
                    }))}
                    placeholder="Select organization"
                    emptyMessage="No organizations available"
                  />
                </section>

                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Creator
                  </p>
                  <CustomSelect
                    value={selectedCreator}
                    onChange={setSelectedCreator}
                    options={creatorOptions.map((creator) => ({
                      label: creator,
                      value: creator,
                    }))}
                    placeholder="Select creator"
                    emptyMessage="No creators available"
                  />
                </section>

                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Priority
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['high', 'medium', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => handlePriorityToggle(level)}
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          priority[level]
                            ? 'bg-[#4F39F6] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </section>

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                  onClick={() =>
                    showToast('Export is not yet available', 'info')
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Jobs
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
                  onClick={() => navigate('/upload-jobs')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobBoard;
