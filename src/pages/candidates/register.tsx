import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import CustomSelect from '@/components/ui/custom-select';
import Breadcrumb from '@/components/ui/breadcrumb';
import DonutIcon from '@/components/ui/donut-chart';
import { SkillTree } from '@/components/ui/skill-tree';
import {
  X,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Upload,
  Loader2,
  Code,
  Calendar,
  Award,
  Mic,
  Search,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  createCandidateAsync,
  parseResumeAsync,
} from '@/store/candidate/actions/candidateActions';
import {
  matchResumeWithJob,
  type ParsedResumeData,
  type ResumeMatchResult,
} from '@/store/candidate/service/candidateService';
import { getAllOrganizations } from '@/store/organization/actions/organizationActions';
import { fetchMajorSkills } from '@/store/majorSkill/actions/majorSkillActions';
import { fetchSkills } from '@/store/skill/actions/skillActions';
import { fetchJobsAsync } from '@/store/job/actions/jobActions';
import type { CandidateCreateRequest } from '@/store/candidate/types/candidateTypes';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { GetCountries } from 'react-country-state-city';
import PhoneInput from 'react-phone-number-input';
import type { Country as PhoneCountry } from 'react-phone-number-input';
import { isSupportedCountry } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface CandidateFormData {
  resumeTitle: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  address1: string;
  address2: string;
  state: string;
  zipCode: string;
  country: string;
  preferredTimeZone: string;
  mobile: string;
  organization: string[];
  majorSkills: string[];
  skills: string[];
  educationDetails: string;
  domainExpertise: string;
  passportNumber: string;
  currentCTC: string;
  currentCompany: string;
  reasonForChange: string;
  experience: string;
  expectedCTC: string;
  currency: string;
  directInterview: boolean;
  skypeID: string;
  source: string;
  noticePeriod: string;
}

type Country = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
};

// Helper function to check if a country code is valid for PhoneInput
const isCountryCode = (value: string): value is PhoneCountry =>
  isSupportedCountry(value as PhoneCountry);

const RegisterCandidate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: isCreating } = useAppSelector((state) => state.candidate);
  const organizationsState = useAppSelector((state) => state.organization);
  const majorSkillsState = useAppSelector((state) => state.majorSkill);
  const skillsState = useAppSelector((state) => state.skill);
  const jobsState = useAppSelector((state) => state.job);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    'upload' | 'general' | 'professional' | 'additional'
  >('upload');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isCvUploaded, setIsCvUploaded] = useState(false);
  const [showCvAlert, setShowCvAlert] = useState(false);
  const [resumeLink, setResumeLink] = useState<string>('');
  const [parsedResumeData, setParsedResumeData] =
    useState<ParsedResumeData | null>(null);
  const [selectedQuestionPack, setSelectedQuestionPack] = useState('');
  const [selectedTechFilter, setSelectedTechFilter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<ResumeMatchResult | null>(
    null,
  );
  const [isMatching, setIsMatching] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CandidateFormData>({
    resumeTitle: '',
    email: '',
    firstName: '',
    lastName: '',
    city: '',
    address1: '',
    address2: '',
    state: '',
    zipCode: '',
    country: '',
    preferredTimeZone: '',
    mobile: '',
    organization: [],
    majorSkills: [],
    skills: [],
    educationDetails: '',
    domainExpertise: '',
    passportNumber: '',
    currentCTC: '',
    currentCompany: '',
    reasonForChange: '',
    experience: '',
    expectedCTC: '',
    currency: '',
    directInterview: false,
    skypeID: '',
    source: '',
    noticePeriod: '',
  });

  // Fetch organizations, major skills, and skills on component mount
  useEffect(() => {
    dispatch(getAllOrganizations({ page: 1, page_size: 100 }));
    dispatch(fetchMajorSkills());
    dispatch(fetchSkills());
  }, [dispatch]);

  useEffect(() => {
    if (!jobsState.items || jobsState.items.length === 0) {
      dispatch(fetchJobsAsync({ page: 1, page_size: 100 }));
    }
  }, [dispatch, jobsState.items?.length]);

  // Populate skills from parsed resume data when both are available
  useEffect(() => {
    if (!parsedResumeData) return;
    if (!majorSkillsState.items || majorSkillsState.items.length === 0) return;
    if (!skillsState.items || skillsState.items.length === 0) return;

    // Helper function to match skill names to IDs
    const matchMajorSkillNamesToIds = (skillNames: string[]): string[] => {
      if (!skillNames || skillNames.length === 0) return [];

      const matchedIds: string[] = [];
      skillNames.forEach((name) => {
        const found = majorSkillsState.items.find(
          (ms) =>
            ms.name.toLowerCase().trim() === name.toLowerCase().trim() ||
            ms.name.toLowerCase().replace(/\s+/g, '') ===
              name.toLowerCase().replace(/\s+/g, ''),
        );
        if (found) {
          matchedIds.push(found.id.toString());
        }
      });
      return matchedIds;
    };

    const matchSkillNamesToIds = (skillNames: string[]): string[] => {
      if (!skillNames || skillNames.length === 0) return [];

      const matchedIds: string[] = [];
      skillNames.forEach((name) => {
        const found = skillsState.items.find(
          (s) =>
            s.name.toLowerCase().trim() === name.toLowerCase().trim() ||
            s.name.toLowerCase().replace(/\s+/g, '') ===
              name.toLowerCase().replace(/\s+/g, ''),
        );
        if (found) {
          matchedIds.push(found.id.toString());
        }
      });
      return matchedIds;
    };

    // Determine skills: prefer matched IDs, fallback to name matching
    let finalSkills: string[] = [];
    if (
      parsedResumeData.matched_skill_ids &&
      Array.isArray(parsedResumeData.matched_skill_ids) &&
      parsedResumeData.matched_skill_ids.length > 0
    ) {
      finalSkills = parsedResumeData.matched_skill_ids.map((id: number) =>
        id.toString(),
      );
      console.log('✅ Using matched skill IDs from parsed data:', finalSkills);
    } else if (
      parsedResumeData.skills &&
      Array.isArray(parsedResumeData.skills) &&
      parsedResumeData.skills.length > 0
    ) {
      finalSkills = matchSkillNamesToIds(parsedResumeData.skills);
      console.log(
        '✅ Matched skill names to IDs:',
        finalSkills,
        'from names:',
        parsedResumeData.skills,
      );
    }

    // Determine major skills:
    // 1. Prefer matched IDs from backend
    // 2. If skills are matched, extract their parent major_skill_ids
    // 3. Fallback to name matching
    let finalMajorSkills: string[] = [];

    if (
      parsedResumeData.matched_major_skill_ids &&
      Array.isArray(parsedResumeData.matched_major_skill_ids) &&
      parsedResumeData.matched_major_skill_ids.length > 0
    ) {
      finalMajorSkills = parsedResumeData.matched_major_skill_ids.map(
        (id: number) => id.toString(),
      );
      console.log(
        '✅ Using matched major skill IDs from backend:',
        finalMajorSkills,
      );
    } else if (
      finalSkills.length > 0 &&
      skillsState.items &&
      skillsState.items.length > 0
    ) {
      // Extract major_skill_ids from matched skills
      const majorSkillIdSet = new Set<number>();
      finalSkills.forEach((skillIdStr) => {
        const skillId = parseInt(skillIdStr, 10);
        const skill = skillsState.items.find((s) => s.id === skillId);
        if (skill && skill.major_skill_id) {
          majorSkillIdSet.add(skill.major_skill_id);
        }
      });

      if (majorSkillIdSet.size > 0) {
        finalMajorSkills = Array.from(majorSkillIdSet).map((id) =>
          id.toString(),
        );
        console.log(
          '✅ Extracted major skill IDs from matched skills:',
          finalMajorSkills,
        );
      }
    } else if (
      parsedResumeData.major_skills &&
      Array.isArray(parsedResumeData.major_skills) &&
      parsedResumeData.major_skills.length > 0
    ) {
      finalMajorSkills = matchMajorSkillNamesToIds(
        parsedResumeData.major_skills,
      );
      console.log(
        '✅ Matched major skill names to IDs:',
        finalMajorSkills,
        'from names:',
        parsedResumeData.major_skills,
      );
    }

    // Only update if we have matches and they're different from current
    if (finalMajorSkills.length > 0 || finalSkills.length > 0) {
      setFormData((prev) => {
        const newMajorSkills =
          finalMajorSkills.length > 0 ? finalMajorSkills : prev.majorSkills;
        const newSkills = finalSkills.length > 0 ? finalSkills : prev.skills;

        // Only update if there's a change
        if (
          newMajorSkills.length !== prev.majorSkills.length ||
          newSkills.length !== prev.skills.length ||
          !newMajorSkills.every((id) => prev.majorSkills.includes(id)) ||
          !newSkills.every((id) => prev.skills.includes(id))
        ) {
          console.log('Updating form data with skills:', {
            newMajorSkills,
            newSkills,
          });
          return {
            ...prev,
            majorSkills: newMajorSkills,
            skills: newSkills,
          };
        }
        return prev;
      });
    }
  }, [parsedResumeData, majorSkillsState.items, skillsState.items]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const countriesData = await GetCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Update selected country when country value changes
  useEffect(() => {
    if (formData.country) {
      const countryId = parseInt(formData.country, 10);
      const foundCountry = countries.find((c) => c.id === countryId);
      if (foundCountry) {
        setSelectedCountry(foundCountry);
      }
    }
  }, [formData.country, countries]);

  // Convert countries to options for Combobox
  const countryOptions = useMemo(() => {
    return countries.map((country) => ({
      value: country.id.toString(),
      label: country.name,
    }));
  }, [countries]);

  const timeZones = [
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'IST', label: 'Indian Standard Time (IST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' },
  ];

  // Get organizations from Redux store
  const organizations =
    organizationsState.organizations
      ?.filter((org) => org.is_active !== false)
      ?.map((org) => ({
        value: org.id.toString(),
        label: org.name,
      })) || [];

  // Get major skills from Redux store (only active ones)
  const majorSkillsOptions =
    majorSkillsState.items
      ?.filter((skill) => skill.is_active !== false)
      ?.map((skill) => ({
        value: skill.id.toString(),
        label: skill.name,
      })) || [];

  // Filter skills by selected major skills, or show all if no major skills selected
  const skillsOptions = useMemo(() => {
    if (!skillsState.items || skillsState.items.length === 0) {
      return [];
    }

    // If no major skills are selected, show all active skills
    if (formData.majorSkills.length === 0) {
      return skillsState.items
        .filter((skill) => skill.is_active !== false)
        .map((skill) => ({
          value: skill.id.toString(),
          label: skill.name,
        }));
    }

    // Filter skills that belong to selected major skills
    return skillsState.items
      .filter((skill) => {
        return (
          skill.is_active !== false &&
          formData.majorSkills.includes(skill.major_skill_id.toString())
        );
      })
      .map((skill) => ({
        value: skill.id.toString(),
        label: skill.name,
      }));
  }, [skillsState.items, formData.majorSkills]);

  // Clear selected skills when major skills change or when skills are filtered
  useEffect(() => {
    if (!skillsState.items || skillsState.items.length === 0) {
      return;
    }

    // If no major skills selected, clear all selected skills
    if (formData.majorSkills.length === 0) {
      if (formData.skills.length > 0) {
        setFormData((prev) => ({ ...prev, skills: [] }));
      }
      return;
    }

    // Get available skill IDs based on current major skills selection
    const availableSkillIds = new Set(
      skillsOptions.map((skill) => skill.value),
    );

    // Filter out skills that don't belong to selected major skills
    const validSkills = formData.skills.filter((skillId) =>
      availableSkillIds.has(skillId),
    );

    // Only update if there's a change
    if (validSkills.length !== formData.skills.length) {
      setFormData((prev) => ({ ...prev, skills: validSkills }));
    }
  }, [formData.majorSkills, skillsOptions, skillsState.items, formData.skills]);

  const experienceOptions = [
    { value: '0-1 Years', label: '0-1 Years' },
    { value: '1-2 Years', label: '1-2 Years' },
    { value: '2-4 Years', label: '2-4 Years' },
    { value: '4-6 Years', label: '4-6 Years' },
    { value: '6-8 Years', label: '6-8 Years' },
    { value: '8+ Years', label: '8+ Years' },
  ];

  const sourceOptions = [
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Indeed', label: 'Indeed' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Company Website', label: 'Company Website' },
    { value: 'Other', label: 'Other' },
  ];

  const noticePeriodOptions = [
    { value: 'Immediate', label: 'Immediate' },
    { value: '15 Days', label: '15 Days' },
    { value: '30 Days', label: '30 Days' },
    { value: '45 Days', label: '45 Days' },
    { value: '60 Days', label: '60 Days' },
    { value: '90 Days', label: '90 Days' },
    { value: '90+ Days', label: '90+ Days' },
  ];

  const parseExperienceYears = (value: string): number => {
    if (!value) return 0;
    const numericMatch = value.match(/\d+/);
    if (!numericMatch) return 0;
    const parsed = parseInt(numericMatch[0], 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const candidateMajorSkillNames = useMemo(() => {
    if (!formData.majorSkills || !majorSkillsState.items) return [];
    return formData.majorSkills
      .map(
        (id) =>
          majorSkillsState.items.find((skill) => skill.id.toString() === id)
            ?.name,
      )
      .filter((name): name is string => Boolean(name));
  }, [formData.majorSkills, majorSkillsState.items]);

  const candidateSkillNames = useMemo(() => {
    if (!formData.skills || !skillsState.items) return [];
    return formData.skills
      .map(
        (id) =>
          skillsState.items.find((skill) => skill.id.toString() === id)?.name,
      )
      .filter((name): name is string => Boolean(name));
  }, [formData.skills, skillsState.items]);

  const jobOptions = useMemo(() => {
    if (!jobsState.items || jobsState.items.length === 0) {
      return [];
    }
    return jobsState.items.map((job) => ({
      value: job.id.toString(),
      label: `${job.job_title} - ${job.organization} (${job.job_category})`,
    }));
  }, [jobsState.items]);

  const questionPackOptions = useMemo(
    () => [
      { value: 'fullstack', label: 'Full-stack Basics' },
      { value: 'react', label: 'React Deep Dive' },
      { value: 'dotnet', label: '.NET Architecture' },
    ],
    [],
  );

  const techFilterOptions = useMemo(
    () => [
      { value: 'tech', label: 'Tech' },
      { value: 'behavioral', label: 'Behavioral' },
      { value: 'manager', label: 'Managerial' },
    ],
    [],
  );

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !jobsState.items) return null;
    return jobsState.items.find((job) => job.id === selectedJobId) ?? null;
  }, [jobsState.items, selectedJobId]);

  const resumeMatchStats = useMemo(() => {
    if (!selectedJob) return null;

    const jobMajorSkillNames =
      selectedJob.major_skills?.map((skill) => skill.name) ?? [];
    const jobSkillNames = selectedJob.skills?.map((skill) => skill.name) ?? [];
    const candidateExp = parseExperienceYears(formData.experience);
    const jobExp = selectedJob.experience_years || 0;

    const matchingMajorSkills = candidateMajorSkillNames.filter((skill) =>
      jobMajorSkillNames.includes(skill),
    );
    const matchingSkills = candidateSkillNames.filter((skill) =>
      jobSkillNames.includes(skill),
    );

    const majorSkillMatchPercent = jobMajorSkillNames.length
      ? (matchingMajorSkills.length / jobMajorSkillNames.length) * 100
      : 0;
    const skillMatchPercent = jobSkillNames.length
      ? (matchingSkills.length / jobSkillNames.length) * 100
      : 0;
    const experienceMatchPercent =
      jobExp > 0
        ? Math.min(100, (candidateExp / jobExp) * 100)
        : candidateExp > 0
          ? 100
          : 0;

    const overallMatchPercent =
      majorSkillMatchPercent * 0.5 +
      skillMatchPercent * 0.3 +
      experienceMatchPercent * 0.2;

    return {
      jobMajorSkillNames,
      jobSkillNames,
      matchingMajorSkills,
      matchingSkills,
      majorSkillMatchPercent,
      skillMatchPercent,
      experienceMatchPercent,
      overallMatchPercent,
      candidateExp,
      jobExp,
    };
  }, [
    candidateMajorSkillNames,
    candidateSkillNames,
    formData.experience,
    selectedJob,
  ]);

  // Currencies list (currently not used, reserved for future use)
  // const currencies = [
  //   { value: 'USD', label: 'USD ($)' },
  //   { value: 'EUR', label: 'EUR (€)' },
  //   { value: 'GBP', label: 'GBP (£)' },
  //   { value: 'INR', label: 'INR (₹)' },
  // ];

  const handleInputChange = (
    field: keyof CandidateFormData,
    value: string | boolean | number | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleOrganizationToggle = (org: string) => {
    setFormData((prev) => {
      const isSelected = prev.organization.includes(org);
      return {
        ...prev,
        organization: isSelected
          ? prev.organization.filter((o) => o !== org)
          : [...prev.organization, org],
      };
    });
    if (errors.organization) {
      setErrors({ ...errors, organization: '' });
    }
  };

  const handleMajorSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const isSelected = prev.majorSkills.includes(skill);
      const newMajorSkills = isSelected
        ? prev.majorSkills.filter((s) => s !== skill)
        : [...prev.majorSkills, skill];

      // Clear error if at least one major skill is selected
      if (errors.majorSkills && newMajorSkills.length > 0) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors.majorSkills;
          return newErrors;
        });
      }

      return {
        ...prev,
        majorSkills: newMajorSkills,
      };
    });
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const isSelected = prev.skills.includes(skill);
      return {
        ...prev,
        skills: isSelected
          ? prev.skills.filter((s) => s !== skill)
          : [...prev.skills, skill],
      };
    });
  };

  const handleSelectAll = () => {
    if (formData.skills.length === skillsOptions.length) {
      setFormData((prev) => ({ ...prev, skills: [] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skills: skillsOptions.map((s) => s.value),
      }));
    }
  };

  const handleJobSelect = (value: string) => {
    const jobId = value ? parseInt(value, 10) : null;
    setSelectedJobId(jobId);
    setMatchResult(null);
  };

  const handleResumeMatch = async () => {
    if (!resumeFile) {
      showToast('Upload a resume before running the match.', 'error');
      return;
    }
    if (!selectedJobId) {
      showToast('Select a job to run the resume match.', 'error');
      return;
    }

    setIsMatching(true);
    setMatchResult(null);
    try {
      const result = await matchResumeWithJob(selectedJobId, resumeFile);
      setMatchResult(result);
    } catch (error) {
      console.error('Failed to match resume with job:', error);
      showToast('Unable to match resume right now. Please try again.', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  const getMatchColor = (value: number) => {
    if (value >= 70) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const renderResumeMatchSection = () => {
    const useAIMatch = Boolean(matchResult && !matchResult.error);
    const fallbackStats = resumeMatchStats;

    const overallMatchValue = useAIMatch
      ? (matchResult?.match_percentage ?? 0)
      : (fallbackStats?.overallMatchPercent ?? 0);

    const skillCoverageValue = useAIMatch
      ? (matchResult?.skill_coverage ??
        (matchResult && matchResult.total_skills
          ? (matchResult.skills_matched /
              Math.max(1, matchResult.total_skills)) *
            100
          : 0))
      : (fallbackStats?.skillMatchPercent ?? 0);

    const experienceMatchValue = useAIMatch
      ? (matchResult?.experience_match ?? 0)
      : (fallbackStats?.experienceMatchPercent ?? 0);

    const educationMatchValue = useAIMatch
      ? (matchResult?.education_match ?? 0)
      : 0;
    const certificationsMatchValue = useAIMatch
      ? (matchResult?.certifications_match ?? 0)
      : 0;
    const roleMatchValue = useAIMatch ? (matchResult?.role_match ?? 0) : 0;

    const missingMajorSkills =
      fallbackStats?.jobMajorSkillNames.filter(
        (skill) => !fallbackStats.matchingMajorSkills.includes(skill),
      ) ?? [];
    const missingSkills =
      fallbackStats?.jobSkillNames.filter(
        (skill) => !fallbackStats.matchingSkills.includes(skill),
      ) ?? [];

    const candidateExpYears =
      fallbackStats?.candidateExp ?? parseExperienceYears(formData.experience);
    const jobExpYears =
      fallbackStats?.jobExp ?? selectedJob?.experience_years ?? 0;

    const skillCoverageDetail = useAIMatch
      ? `${matchResult?.skills_matched ?? 0} of ${
          matchResult?.total_skills ?? 0
        } skills matched`
      : `${fallbackStats?.matchingSkills.length ?? 0} of ${
          fallbackStats?.jobSkillNames.length ?? 0
        } skills matched`;
    const experienceDetail =
      jobExpYears > 0
        ? candidateExpYears >= jobExpYears
          ? 'Meets requirement'
          : `Short by ${Math.max(0, jobExpYears - candidateExpYears)} years`
        : 'No requirement set';
    const explanationCopy = useAIMatch
      ? matchResult?.explanation || 'AI match scores generated by Gemini'
      : matchResult?.error ||
        'Basic comparison summary shown (AI unavailable).';

    const metricCircles = [
      {
        key: 'overall',
        label: 'Match %',
        value: overallMatchValue,
      },
      {
        key: 'skill',
        label: 'Skill Coverage',
        value: skillCoverageValue,
        detail: skillCoverageDetail,
      },
      {
        key: 'experience',
        label: 'Exp. Match',
        value: experienceMatchValue,
        detail: experienceDetail,
      },
      {
        key: 'education',
        label: 'Education Match',
        value: educationMatchValue,
      },
      {
        key: 'certifications',
        label: 'Certifications',
        value: certificationsMatchValue,
      },
      {
        key: 'role',
        label: 'Role Match',
        value: roleMatchValue,
      },
    ];

    return (
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Resume Match Insights
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Compare the uploaded resume with open roles to highlight overlap
              in skills and experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span
              className={`px-2 py-0.5 rounded-full border ${
                resumeFile
                  ? 'border-green-200 text-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
              }`}
            >
              {resumeFile ? 'Resume uploaded' : 'Upload resume to enable match'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border ${
                selectedJob
                  ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 text-gray-500 bg-gray-50 dark:bg-slate-800'
              }`}
            >
              {selectedJob
                ? `Matching against ${selectedJob.job_title}`
                : 'Select a job to match'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Select Job
              </label>
              <CustomSelect
                value={selectedJobId?.toString() || ''}
                onChange={handleJobSelect}
                options={jobOptions}
                placeholder={
                  jobsState.isLoading ? 'Loading jobs...' : 'Choose a job'
                }
                className="w-full text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                disabled={jobsState.isLoading || jobOptions.length === 0}
              />
              {jobOptions.length === 0 && !jobsState.isLoading && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Create at least one job to start matching resumes.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResumeMatch}
                disabled={
                  !resumeFile ||
                  !selectedJobId ||
                  isMatching ||
                  jobsState.isLoading
                }
                className="h-8 text-xs flex items-center gap-1.5"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Matching...
                  </>
                ) : (
                  'Run Match'
                )}
              </Button>
              {matchResult && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => setMatchResult(null)}
                >
                  Clear Result
                </Button>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              We will use AI-powered matching when available. Otherwise we fall
              back to a smart comparison based on selected skills and
              experience.
            </p>
          </div>

          <div className="space-y-3">
            {!resumeFile ? (
              <div className="h-full border border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center text-center">
                Upload a resume in Step 1 to unlock matching insights.
              </div>
            ) : !selectedJob ? (
              <div className="h-full border border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center text-center">
                Select a job to see how the resume aligns with its requirements.
              </div>
            ) : isMatching ? (
              <div className="h-full border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                Matching resume with job requirements...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  {metricCircles.map((metric) => (
                    <div
                      key={metric.key}
                      className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-3 text-center shadow-sm"
                    >
                      <DonutIcon
                        value={Math.max(0, Math.min(100, metric.value))}
                        color={getMatchColor(metric.value)}
                        size={72}
                      />
                      <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        {metric.label}
                      </p>
                      {metric.detail && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {metric.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-200">
                  <p className="font-semibold mb-1">
                    Resume Match: {overallMatchValue.toFixed(0)}%
                  </p>
                  <p>{explanationCopy}</p>
                </div>
                {fallbackStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                        Major Skills Coverage
                      </p>
                      {fallbackStats.matchingMajorSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fallbackStats.matchingMajorSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No overlapping major skills detected.
                        </p>
                      )}
                      {missingMajorSkills.length > 0 && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Missing: {missingMajorSkills.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                        Skills Coverage
                      </p>
                      {fallbackStats.matchingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fallbackStats.matchingSkills
                            .slice(0, 6)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {skill}
                              </span>
                            ))}
                          {fallbackStats.matchingSkills.length > 6 && (
                            <span className="text-gray-500 dark:text-gray-400">
                              +{fallbackStats.matchingSkills.length - 6} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No overlapping skills detected.
                        </p>
                      )}
                      {missingSkills.length > 0 && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Missing: {missingSkills.slice(0, 5).join(', ')}
                          {missingSkills.length > 5 && ' + more'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {selectedJob && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Experience comparison: {candidateExpYears}y vs {jobExpYears}
                    y required.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {useAIMatch &&
          matchResult?.skill_tree &&
          matchResult.skill_tree.length > 0 && (
            <div className="mt-6">
              <SkillTree skills={matchResult.skill_tree} />
            </div>
          )}

        <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Technical Follow-up
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <Mic className="h-4 w-4" />
              Upload Audio
            </Button>
            <CustomSelect
              value={selectedQuestionPack}
              onChange={(value) => setSelectedQuestionPack(value)}
              options={questionPackOptions}
              placeholder="Select technical question set"
              className="flex-1"
            />
            <CustomSelect
              value={selectedTechFilter}
              onChange={(value) => setSelectedTechFilter(value)}
              options={techFilterOptions}
              placeholder="Category"
              className="w-full lg:w-40"
            />
            <Button type="button" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Analyze
            </Button>
          </div>
        </div>

        {parsedResumeData?.projects && parsedResumeData.projects.length > 0 && (
          <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-3.5 w-3.5 text-gray-500" />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Projects spotted in resume
              </p>
            </div>
            <div className="space-y-3">
              {parsedResumeData.projects.slice(0, 2).map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {project.name}
                      </p>
                      {project.role && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Role: {project.role}
                        </p>
                      )}
                    </div>
                    {project.duration && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{project.duration}</span>
                      </div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-2">
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies
                        .slice(0, 6)
                        .map((tech, techIndex) => (
                          <span
                            key={`${project.name}-${tech}-${techIndex}`}
                            className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200 text-[10px]"
                          >
                            {tech}
                          </span>
                        ))}
                    </div>
                  )}
                  {project.achievements && (
                    <div className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300 mt-2">
                      <Award className="h-3 w-3 text-yellow-500" />
                      <span>{project.achievements}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Backend required fields only
    if (!formData.resumeTitle || !formData.resumeTitle.trim()) {
      newErrors.resumeTitle = 'Resume Title is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.preferredTimeZone) {
      newErrors.preferredTimeZone = 'Preferred Time Zone is required';
    }

    // Major Skills is mandatory
    if (!formData.majorSkills || formData.majorSkills.length === 0) {
      newErrors.majorSkills = 'At least one Major Skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission on the last step (Additional Details)
    if (activeTab !== 'additional') {
      // If not on last step, navigate to the next step instead
      handleNext();
      return;
    }

    // Validate all steps before submission
    // Step 1: General Details validation - only backend required fields
    const generalErrors: { [key: string]: string } = {};
    if (!formData.resumeTitle || !formData.resumeTitle.trim()) {
      generalErrors.resumeTitle = 'Resume Title is required';
    }
    if (!formData.email) generalErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      generalErrors.email = 'Invalid email format';
    if (!formData.firstName || !formData.firstName.trim()) {
      generalErrors.firstName = 'First Name is required';
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      generalErrors.lastName = 'Last Name is required';
    }
    if (!formData.country) generalErrors.country = 'Country is required';
    if (!formData.preferredTimeZone)
      generalErrors.preferredTimeZone = 'Preferred Time Zone is required';

    // Step 2: Professional Information validation
    const professionalErrors: { [key: string]: string } = {};

    // Major Skills is mandatory
    if (!formData.majorSkills || formData.majorSkills.length === 0) {
      professionalErrors.majorSkills = 'At least one Major Skill is required';
    }

    // Combine all errors
    const allErrors = { ...generalErrors, ...professionalErrors };

    if (Object.keys(allErrors).length > 0) {
      // Show errors and switch to the first tab with errors
      setErrors(allErrors);

      // Navigate to the first tab with errors
      if (Object.keys(generalErrors).length > 0) {
        setActiveTab('general');
      } else if (Object.keys(professionalErrors).length > 0) {
        setActiveTab('professional');
      }

      setErrors((prev) => ({
        ...prev,
        ...allErrors,
        submit: 'Please complete all required fields before submitting',
      }));
      return;
    }

    // Run full form validation
    if (!validateForm()) {
      // If validation fails, show errors and don't submit
      setErrors((prev) => ({
        ...prev,
        submit: 'Please complete all required fields before submitting',
      }));
      return;
    }

    // Clear previous submit errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    try {
      // Parse experience years from string format "0-1 Years" or "8+ Years"
      let experienceYears: number | null = null;
      if (formData.experience) {
        if (formData.experience.includes('+')) {
          experienceYears = parseInt(formData.experience.split('+')[0]);
        } else if (formData.experience.includes('-')) {
          experienceYears = parseInt(formData.experience.split('-')[0]);
        } else {
          experienceYears = parseInt(formData.experience) || null;
        }
      }

      // Parse CTC values - remove any currency symbols and commas
      const parseCTCValue = (value: string): number | null => {
        if (!value || !value.trim()) return null;
        const cleaned = value.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };

      // Convert major skill IDs to names
      const majorSkillNames = formData.majorSkills
        .map((id) => {
          const majorSkill = majorSkillsState.items?.find(
            (skill) => skill.id.toString() === id,
          );
          return majorSkill?.name;
        })
        .filter((name): name is string => Boolean(name));

      // Convert skill IDs to names
      const skillNames = formData.skills
        .map((id) => {
          const skill = skillsState.items?.find((s) => s.id.toString() === id);
          return skill?.name;
        })
        .filter((name): name is string => Boolean(name));

      // Transform form data to API format
      const candidatePayload: CandidateCreateRequest = {
        resume_title: formData.resumeTitle || '',
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        address1: formData.address1 || null,
        address2: formData.address2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        country: formData.country,
        preferred_time_zone: formData.preferredTimeZone,
        mobile: formData.mobile || null,
        currency: formData.currency || null,
        education_details: formData.educationDetails || null,
        current_company: formData.currentCompany || null,
        direct_interview: formData.directInterview,
        domain_expertise: formData.domainExpertise || null,
        reason_for_change: formData.reasonForChange || null,
        skype_id: formData.skypeID || null,
        experience_years: experienceYears,
        source: formData.source || null,
        passport_number: formData.passportNumber || null,
        current_ctc: parseCTCValue(formData.currentCTC),
        expected_ctc: parseCTCValue(formData.expectedCTC),
        notice_period: formData.noticePeriod || null,
        resume_link: resumeLink || null,
        organization_ids: formData.organization.map((id) => parseInt(id)),
        // API expects skill names, not IDs
        major_skills: majorSkillNames,
        skills: skillNames,
      };

      await dispatch(createCandidateAsync(candidatePayload)).unwrap();
      navigate('/candidates');
    } catch (error: unknown) {
      console.error('Failed to create candidate:', error);
      let errorMessage = 'Failed to create candidate. Please try again.';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message) || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setErrors({
        submit: errorMessage,
      });
    }
  };

  // Tab navigation functions
  const handleNext = (e?: React.MouseEvent) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate current tab before moving to next
    if (activeTab === 'upload') {
      // Check if CV is uploaded
      if (!isCvUploaded) {
        // Show custom popup alert instead of inline error
        setShowCvAlert(true);
        return false;
      }
      // Clear errors and move to general tab
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.submit;
        return newErrors;
      });
      setActiveTab('general');
      return false;
    } else if (activeTab === 'general') {
      // Validate general tab required fields - only backend required fields
      const generalErrors: { [key: string]: string } = {};
      if (!formData.resumeTitle || !formData.resumeTitle.trim()) {
        generalErrors.resumeTitle = 'Resume Title is required';
      }
      if (!formData.email) generalErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        generalErrors.email = 'Invalid email format';
      if (!formData.firstName || !formData.firstName.trim()) {
        generalErrors.firstName = 'First Name is required';
      }
      if (!formData.lastName || !formData.lastName.trim()) {
        generalErrors.lastName = 'Last Name is required';
      }
      if (!formData.country) generalErrors.country = 'Country is required';
      if (!formData.preferredTimeZone)
        generalErrors.preferredTimeZone = 'Preferred Time Zone is required';

      if (Object.keys(generalErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...generalErrors }));
        return false;
      }
      // Clear errors for this tab before moving to next
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.resumeTitle;
        delete newErrors.email;
        delete newErrors.firstName;
        delete newErrors.lastName;
        delete newErrors.country;
        delete newErrors.preferredTimeZone;
        return newErrors;
      });
      setActiveTab('professional');
      return false;
    } else if (activeTab === 'professional') {
      // Validate professional tab - Major Skills is mandatory
      const professionalErrors: { [key: string]: string } = {};

      if (!formData.majorSkills || formData.majorSkills.length === 0) {
        professionalErrors.majorSkills = 'At least one Major Skill is required';
      }

      if (Object.keys(professionalErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...professionalErrors }));
        return false;
      }

      // Clear errors for this tab before moving to next
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.majorSkills;
        return newErrors;
      });
      setActiveTab('additional');
      return false;
    } else if (activeTab === 'additional') {
      // Already on last step; do nothing
      return false;
    }
    return false;
  };

  const handlePrevious = () => {
    if (activeTab === 'general') {
      setActiveTab('upload');
    } else if (activeTab === 'professional') {
      setActiveTab('general');
    } else if (activeTab === 'additional') {
      setActiveTab('professional');
    }
  };

  // Handle file upload for resume parsing
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOCX, DOC)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      setErrors({
        submit: 'Please upload a PDF, DOCX, or DOC file only',
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({
        submit: 'File size exceeds 10MB limit',
      });
      return;
    }

    setIsParsingResume(true);
    setErrors({});
    setResumeFile(file);
    setSelectedJobId(null);
    setMatchResult(null);

    try {
      const parsedData = await dispatch(parseResumeAsync(file)).unwrap();

      // Populate form with parsed data
      if (parsedData) {
        console.log('Parsed resume data:', parsedData);
        console.log(
          'Matched major skill IDs:',
          parsedData.matched_major_skill_ids,
        );
        console.log('Matched skill IDs:', parsedData.matched_skill_ids);
        console.log('Available major skills:', majorSkillsState.items);
        console.log('Available skills:', skillsState.items);

        // Helper function to match skill names to IDs
        const matchMajorSkillNamesToIds = (skillNames: string[]): string[] => {
          if (
            !skillNames ||
            skillNames.length === 0 ||
            !majorSkillsState.items ||
            majorSkillsState.items.length === 0
          ) {
            return [];
          }

          const matchedIds: string[] = [];
          skillNames.forEach((name) => {
            const found = majorSkillsState.items.find(
              (ms) =>
                ms.name.toLowerCase().trim() === name.toLowerCase().trim() ||
                ms.name.toLowerCase().replace(/\s+/g, '') ===
                  name.toLowerCase().replace(/\s+/g, ''),
            );
            if (found) {
              matchedIds.push(found.id.toString());
            }
          });
          return matchedIds;
        };

        const matchSkillNamesToIds = (skillNames: string[]): string[] => {
          if (
            !skillNames ||
            skillNames.length === 0 ||
            !skillsState.items ||
            skillsState.items.length === 0
          ) {
            return [];
          }

          const matchedIds: string[] = [];
          skillNames.forEach((name) => {
            const found = skillsState.items.find(
              (s) =>
                s.name.toLowerCase().trim() === name.toLowerCase().trim() ||
                s.name.toLowerCase().replace(/\s+/g, '') ===
                  name.toLowerCase().replace(/\s+/g, ''),
            );
            if (found) {
              matchedIds.push(found.id.toString());
            }
          });
          return matchedIds;
        };

        // Determine skills: prefer matched IDs, fallback to name matching
        let finalSkills: string[] = [];
        if (
          parsedData.matched_skill_ids &&
          Array.isArray(parsedData.matched_skill_ids) &&
          parsedData.matched_skill_ids.length > 0
        ) {
          finalSkills = parsedData.matched_skill_ids.map((id: number) =>
            id.toString(),
          );
          console.log('✅ Using matched skill IDs from backend:', finalSkills);
        } else if (
          parsedData.skills &&
          Array.isArray(parsedData.skills) &&
          parsedData.skills.length > 0
        ) {
          // Try to match by name if IDs not available
          if (skillsState.items && skillsState.items.length > 0) {
            finalSkills = matchSkillNamesToIds(parsedData.skills);
            console.log(
              '✅ Matched skill names to IDs (frontend):',
              finalSkills,
              'from names:',
              parsedData.skills,
            );
          } else {
            console.log('⚠️ Skills not loaded yet, will match when loaded');
          }
        } else {
          console.log('⚠️ No skills found in parsed data');
        }

        // Determine major skills:
        // 1. Prefer matched IDs from backend
        // 2. If skills are matched, extract their parent major_skill_ids
        // 3. Fallback to name matching
        let finalMajorSkills: string[] = [];

        if (
          parsedData.matched_major_skill_ids &&
          Array.isArray(parsedData.matched_major_skill_ids) &&
          parsedData.matched_major_skill_ids.length > 0
        ) {
          finalMajorSkills = parsedData.matched_major_skill_ids.map(
            (id: number) => id.toString(),
          );
          console.log(
            '✅ Using matched major skill IDs from backend:',
            finalMajorSkills,
          );
        } else if (
          finalSkills.length > 0 &&
          skillsState.items &&
          skillsState.items.length > 0
        ) {
          // Extract major_skill_ids from matched skills
          const majorSkillIdSet = new Set<number>();
          finalSkills.forEach((skillIdStr) => {
            const skillId = parseInt(skillIdStr, 10);
            const skill = skillsState.items.find((s) => s.id === skillId);
            if (skill && skill.major_skill_id) {
              majorSkillIdSet.add(skill.major_skill_id);
            }
          });

          if (majorSkillIdSet.size > 0) {
            finalMajorSkills = Array.from(majorSkillIdSet).map((id) =>
              id.toString(),
            );
            console.log(
              '✅ Extracted major skill IDs from matched skills:',
              finalMajorSkills,
            );
          }
        } else if (
          parsedData.major_skills &&
          Array.isArray(parsedData.major_skills) &&
          parsedData.major_skills.length > 0
        ) {
          // Try to match by name if IDs not available
          if (majorSkillsState.items && majorSkillsState.items.length > 0) {
            finalMajorSkills = matchMajorSkillNamesToIds(
              parsedData.major_skills,
            );
            console.log(
              '✅ Matched major skill names to IDs (frontend):',
              finalMajorSkills,
              'from names:',
              parsedData.major_skills,
            );
          } else {
            console.log(
              '⚠️ Major skills not loaded yet, will match when loaded',
            );
          }
        } else {
          console.log('⚠️ No major skills found in parsed data');
        }

        setFormData((prev) => ({
          ...prev,
          resumeTitle: parsedData.resume_title || prev.resumeTitle,
          email: parsedData.email || prev.email,
          firstName: parsedData.first_name || prev.firstName,
          lastName: parsedData.last_name || prev.lastName,
          city: parsedData.city || prev.city,
          address1: parsedData.address1 || prev.address1,
          state: parsedData.state || prev.state,
          zipCode: parsedData.zip_code || prev.zipCode,
          country: parsedData.country || prev.country,
          preferredTimeZone:
            parsedData.preferred_time_zone || prev.preferredTimeZone,
          mobile: parsedData.phone || prev.mobile,
          organization: prev.organization, // Keep existing, as we can't match from parsed data
          // Use matched IDs (from backend or frontend matching)
          majorSkills:
            finalMajorSkills.length > 0 ? finalMajorSkills : prev.majorSkills,
          skills: finalSkills.length > 0 ? finalSkills : prev.skills,
          educationDetails:
            parsedData.education_details ||
            parsedData.education ||
            prev.educationDetails,
          domainExpertise: parsedData.domain_expertise || prev.domainExpertise,
          passportNumber: parsedData.passport_number || prev.passportNumber,
          currentCTC: parsedData.current_ctc || prev.currentCTC,
          currentCompany: parsedData.current_company || prev.currentCompany,
          reasonForChange: parsedData.reason_for_change || prev.reasonForChange,
          experience: parsedData.total_experience
            ? `${parsedData.total_experience} Years`
            : prev.experience,
          expectedCTC: parsedData.expected_ctc || prev.expectedCTC,
          skypeID: parsedData.skype_id || prev.skypeID,
          source: parsedData.source || prev.source,
          noticePeriod: parsedData.notice_period || prev.noticePeriod,
        }));

        // Update phone number if available
        if (parsedData.phone) {
          setPhoneNumber(parsedData.phone);
        }

        // Update selected country if available
        if (parsedData.country && countries.length > 0) {
          const countryFound = countries.find(
            (c) => c.name.toLowerCase() === parsedData.country?.toLowerCase(),
          );
          if (countryFound) {
            setSelectedCountry(countryFound);
            setFormData((prev) => ({
              ...prev,
              country: countryFound.id.toString(),
            }));
          }
        }

        // Store resume_link from parsed data
        if (parsedData.resume_link) {
          setResumeLink(parsedData.resume_link || '');
        }

        // Store parsed data for later skill matching (in case skills aren't loaded yet)
        setParsedResumeData(parsedData);

        // Mark CV as uploaded and switch to General Details tab to show populated data
        setIsCvUploaded(true);
        setActiveTab('general');
      }
    } catch (error: unknown) {
      console.error('Failed to parse resume:', error);
      let errorMessage = 'Failed to parse resume. Please try again.';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message) || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Clean up error message - remove technical details
      // Remove class names and technical details
      errorMessage = errorMessage.replace(/got <class '[^']+'>/g, '');
      errorMessage = errorMessage.replace(
        /Response content 'parts' is not a list, /g,
        '',
      );
      errorMessage = errorMessage.replace(
        /Failed to parse resume with AI: /g,
        '',
      );
      errorMessage = errorMessage.replace(
        /Failed to upload resume to S3: /g,
        '',
      );
      errorMessage = errorMessage.trim();

      // Show error in toast instead of popup
      showToast(
        errorMessage || 'Failed to upload or parse resume. Please try again.',
        'error',
      );

      // Clear inline errors
      setErrors({});
    } finally {
      setIsParsingResume(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const role = useUserRole();

  return (
    <MainLayout role={role}>
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Candidates', href: '/candidates' },
              { label: 'Register Candidate' },
            ]}
          />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Register Candidate
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Add a new candidate to the system
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/candidates')}
                  className="flex items-center gap-1.5 h-8 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Stepper Progress Indicator */}
                <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    {/* Step Indicators */}
                    <div className="flex items-center w-full">
                      {/* Step 1 - Upload CV */}
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                              activeTab === 'upload'
                                ? 'bg-[#4F39F6] text-white border-[#4F39F6] dark:bg-[#4F39F6] dark:border-[#4F39F6]'
                                : activeTab === 'general' ||
                                    activeTab === 'professional' ||
                                    activeTab === 'additional'
                                  ? 'bg-green-500 text-white border-green-500 dark:bg-green-500 dark:border-green-500'
                                  : 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'
                            }`}
                          >
                            {activeTab === 'general' ||
                            activeTab === 'professional' ||
                            activeTab === 'additional' ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              '1'
                            )}
                          </div>
                          <span
                            className={`text-xs mt-1.5 font-medium ${
                              activeTab === 'upload'
                                ? 'text-[#4F39F6] dark:text-[#4F39F6]'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            Upload CV
                          </span>
                        </div>
                        <div
                          className={`h-0.5 flex-1 mx-2 transition-colors ${
                            activeTab === 'general' ||
                            activeTab === 'professional' ||
                            activeTab === 'additional'
                              ? 'bg-green-500 dark:bg-green-500'
                              : 'bg-gray-300 dark:bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Step 2 - General */}
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                              activeTab === 'general'
                                ? 'bg-[#4F39F6] text-white border-[#4F39F6] dark:bg-[#4F39F6] dark:border-[#4F39F6]'
                                : activeTab === 'professional' ||
                                    activeTab === 'additional'
                                  ? 'bg-green-500 text-white border-green-500 dark:bg-green-500 dark:border-green-500'
                                  : 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'
                            }`}
                          >
                            {activeTab === 'professional' ||
                            activeTab === 'additional' ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              '2'
                            )}
                          </div>
                          <span
                            className={`text-xs mt-1.5 font-medium ${
                              activeTab === 'general'
                                ? 'text-[#4F39F6] dark:text-[#4F39F6]'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            General
                          </span>
                        </div>
                        <div
                          className={`h-0.5 flex-1 mx-2 transition-colors ${
                            activeTab === 'professional' ||
                            activeTab === 'additional'
                              ? 'bg-green-500 dark:bg-green-500'
                              : 'bg-gray-300 dark:bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Step 3 - Professional */}
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                              activeTab === 'professional'
                                ? 'bg-[#4F39F6] text-white border-[#4F39F6] dark:bg-[#4F39F6] dark:border-[#4F39F6]'
                                : activeTab === 'additional'
                                  ? 'bg-green-500 text-white border-green-500 dark:bg-green-500 dark:border-green-500'
                                  : 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'
                            }`}
                          >
                            {activeTab === 'additional' ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              '3'
                            )}
                          </div>
                          <span
                            className={`text-xs mt-1.5 font-medium ${
                              activeTab === 'professional'
                                ? 'text-[#4F39F6] dark:text-[#4F39F6]'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            Professional
                          </span>
                        </div>
                        <div
                          className={`h-0.5 flex-1 mx-2 transition-colors ${
                            activeTab === 'additional'
                              ? 'bg-green-500 dark:bg-green-500'
                              : 'bg-gray-300 dark:bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Step 4 - Additional */}
                      <div className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                              activeTab === 'additional'
                                ? 'bg-[#4F39F6] text-white border-[#4F39F6] dark:bg-[#4F39F6] dark:border-[#4F39F6]'
                                : 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'
                            }`}
                          >
                            4
                          </div>
                          <span
                            className={`text-xs mt-1.5 font-medium ${
                              activeTab === 'additional'
                                ? 'text-[#4F39F6] dark:text-[#4F39F6]'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            Additional
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Counter */}
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Step{' '}
                      {activeTab === 'upload'
                        ? '1'
                        : activeTab === 'general'
                          ? '2'
                          : activeTab === 'professional'
                            ? '3'
                            : '4'}{' '}
                      of 4
                    </span>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="px-4 py-4">
                  {/* Upload CV Tab */}
                  {activeTab === 'upload' && (
                    <div className="flex flex-col items-center justify-center py-4 px-4">
                      <div className="w-full max-w-md">
                        <div className="text-center mb-3">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Upload Candidate Resume
                          </h3>
                          <p className="text-[10px] text-gray-600 dark:text-gray-400">
                            Upload a PDF, DOCX, or DOC file to automatically
                            populate the form fields
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-[#4F39F6] dark:hover:border-[#4F39F6] transition-colors">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleUploadButtonClick}
                            disabled={isParsingResume}
                            className="flex items-center gap-1.5 h-8 text-xs border-slate-200 dark:border-slate-700 mb-2"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {isParsingResume
                              ? 'Parsing Resume...'
                              : 'Choose File'}
                          </Button>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Supported formats: PDF, DOCX, DOC (Max 10MB)
                          </p>
                        </div>

                        {isCvUploaded && (
                          <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-2">
                            <p className="text-[10px] text-green-600 dark:text-green-400">
                              ✓ Resume uploaded and parsed successfully! Click
                              Next to continue.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* General Details Tab */}
                  {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Column 1 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Resume Title <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.resumeTitle}
                            onChange={(e) =>
                              handleInputChange('resumeTitle', e.target.value)
                            }
                            placeholder="Enter resume title"
                            className={`h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 ${errors.resumeTitle ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.resumeTitle && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.resumeTitle}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            User Name (Email){' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value)
                            }
                            placeholder="Enter Email"
                            className={`h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.email && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            City
                          </label>
                          <Input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange('city', e.target.value)
                            }
                            placeholder="Enter city"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <Combobox
                            options={countryOptions}
                            value={formData.country}
                            onValueChange={(value) => {
                              handleInputChange('country', value);
                              const countryId = parseInt(value, 10);
                              const foundCountry = countries.find(
                                (c) => c.id === countryId,
                              );
                              if (foundCountry) {
                                setSelectedCountry(foundCountry);
                              }
                            }}
                            placeholder={
                              loadingCountries ? 'Loading...' : 'Select Country'
                            }
                            searchPlaceholder="Search countries..."
                            emptyMessage="No countries found"
                            loading={loadingCountries}
                            className={`w-full text-xs ${errors.country ? 'border-red-500 dark:border-red-500' : ''}`}
                            disabled={loadingCountries}
                          />
                          {errors.country && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.country}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange('firstName', e.target.value)
                            }
                            placeholder="Enter first name"
                            className={`h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 ${errors.firstName ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.firstName && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Address 1
                          </label>
                          <Input
                            type="text"
                            value={formData.address1}
                            onChange={(e) =>
                              handleInputChange('address1', e.target.value)
                            }
                            placeholder="Enter address"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            State
                          </label>
                          <Input
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              handleInputChange('state', e.target.value)
                            }
                            placeholder="Enter state"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Preferred Time Zone{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <CustomSelect
                            value={formData.preferredTimeZone}
                            onChange={(value) =>
                              handleInputChange('preferredTimeZone', value)
                            }
                            options={timeZones}
                            placeholder="Select Time Zone"
                            className={`w-full text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 ${errors.preferredTimeZone ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.preferredTimeZone && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.preferredTimeZone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange('lastName', e.target.value)
                            }
                            placeholder="Enter last name"
                            className={`h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 ${errors.lastName ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.lastName && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.lastName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Address 2
                          </label>
                          <Input
                            type="text"
                            value={formData.address2}
                            onChange={(e) =>
                              handleInputChange('address2', e.target.value)
                            }
                            placeholder="Enter address"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Zip Code
                          </label>
                          <Input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) =>
                              handleInputChange('zipCode', e.target.value)
                            }
                            placeholder="Enter zip code"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Mobile
                          </label>
                          <PhoneInput
                            international
                            defaultCountry={
                              selectedCountry?.iso2 &&
                              isCountryCode(selectedCountry.iso2.toUpperCase())
                                ? (selectedCountry.iso2.toUpperCase() as PhoneCountry)
                                : 'US'
                            }
                            value={phoneNumber || formData.mobile}
                            onChange={(value) => {
                              setPhoneNumber(value || '');
                              handleInputChange('mobile', value || '');
                            }}
                            className="phone-input-container"
                            disabled={!selectedCountry}
                          />
                          {errors.mobile && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.mobile}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Currency
                          </label>
                          <Input
                            type="text"
                            value={formData.currency}
                            onChange={(e) =>
                              handleInputChange('currency', e.target.value)
                            }
                            placeholder="Enter currency"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Skype ID
                          </label>
                          <Input
                            type="text"
                            value={formData.skypeID}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 100);
                              handleInputChange('skypeID', value);
                            }}
                            placeholder="Enter Skype ID"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                            maxLength={100}
                          />
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {formData.skypeID.length}/100
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Professional Information Tab */}
                  {activeTab === 'professional' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Column 1 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Organization
                          </label>
                          {organizationsState.loading ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              Loading organizations...
                            </div>
                          ) : organizations.length === 0 ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              No organizations available
                            </div>
                          ) : (
                            <div className="space-y-1 border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 max-h-[200px] overflow-y-auto overflow-x-hidden dark:bg-slate-700/50">
                              {organizations.map((org) => (
                                <label
                                  key={org.value}
                                  className="flex items-center gap-1.5 cursor-pointer p-1 hover:bg-gray-50 dark:hover:bg-slate-600 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.organization.includes(
                                      org.value,
                                    )}
                                    onChange={() =>
                                      handleOrganizationToggle(org.value)
                                    }
                                    className="h-3 w-3 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-slate-600 rounded flex-shrink-0"
                                  />
                                  <span className="text-xs text-gray-700 dark:text-gray-200 truncate">
                                    {org.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                          {errors.organization && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.organization}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Current Company
                          </label>
                          <Input
                            type="text"
                            value={formData.currentCompany}
                            onChange={(e) =>
                              handleInputChange(
                                'currentCompany',
                                e.target.value,
                              )
                            }
                            placeholder="Enter current company"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Current CTC (P.A)
                          </label>
                          <Input
                            type="text"
                            value={formData.currentCTC}
                            onChange={(e) =>
                              handleInputChange('currentCTC', e.target.value)
                            }
                            placeholder="Enter current CTC"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Exp (Yrs)
                          </label>
                          <CustomSelect
                            value={formData.experience}
                            onChange={(value) =>
                              handleInputChange('experience', value)
                            }
                            options={experienceOptions}
                            placeholder="Select Experience"
                            className="w-full text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Source
                          </label>
                          <CustomSelect
                            value={formData.source}
                            onChange={(value) =>
                              handleInputChange('source', value)
                            }
                            options={sourceOptions}
                            placeholder="Select Source"
                            className="w-full text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Major Skills <span className="text-red-500">*</span>
                          </label>
                          {majorSkillsState.isLoading ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              Loading major skills...
                            </div>
                          ) : majorSkillsOptions.length === 0 ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              No major skills available
                            </div>
                          ) : (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 max-h-[200px] overflow-y-auto overflow-x-hidden dark:bg-slate-700/50">
                              <div className="space-y-1 dark:bg-slate-700/50">
                                {majorSkillsOptions.map((skill) => (
                                  <label
                                    key={skill.value}
                                    className="flex items-center gap-1.5 cursor-pointer p-0.5 hover:bg-gray-50 dark:hover:bg-slate-600 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.majorSkills.includes(
                                        skill.value,
                                      )}
                                      onChange={() =>
                                        handleMajorSkillToggle(skill.value)
                                      }
                                      className="h-3 w-3 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-slate-600 rounded flex-shrink-0"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate">
                                      {skill.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {errors.majorSkills && (
                            <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
                              {errors.majorSkills}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Expected CTC (P.A)
                          </label>
                          <Input
                            type="text"
                            value={formData.expectedCTC}
                            onChange={(e) =>
                              handleInputChange('expectedCTC', e.target.value)
                            }
                            placeholder="Enter expected CTC"
                            className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Notice Period
                          </label>
                          <CustomSelect
                            value={formData.noticePeriod}
                            onChange={(value) =>
                              handleInputChange('noticePeriod', value)
                            }
                            options={noticePeriodOptions}
                            placeholder="Select notice period"
                            className="w-full text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Skills
                            {formData.majorSkills.length > 0 ? (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                                ({skillsOptions.length} available for{' '}
                                {formData.majorSkills.length} major skill
                                {formData.majorSkills.length > 1 ? 's' : ''})
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                                (Select major skills to filter)
                              </span>
                            )}
                          </label>
                          {skillsState.isLoading ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              Loading skills...
                            </div>
                          ) : formData.majorSkills.length === 0 ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700/50">
                              Please select major skills first to view related
                              skills
                            </div>
                          ) : skillsOptions.length === 0 ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                              No skills available for selected major skills
                            </div>
                          ) : (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 max-h-[200px] overflow-y-auto overflow-x-hidden dark:bg-slate-700/50">
                              <label className="flex items-center gap-1.5 cursor-pointer mb-1.5 pb-1.5 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <input
                                  type="checkbox"
                                  checked={
                                    skillsOptions.length > 0 &&
                                    formData.skills.length ===
                                      skillsOptions.length
                                  }
                                  onChange={handleSelectAll}
                                  className="h-3 w-3 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 rounded flex-shrink-0"
                                />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                  Select All
                                </span>
                              </label>
                              <div className="space-y-1 dark:bg-slate-700/50">
                                {skillsOptions.map((skill) => (
                                  <label
                                    key={skill.value}
                                    className="flex items-center gap-1.5 cursor-pointer p-0.5 hover:bg-gray-50 dark:hover:bg-slate-600 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.skills.includes(
                                        skill.value,
                                      )}
                                      onChange={() =>
                                        handleSkillToggle(skill.value)
                                      }
                                      className="h-3 w-3 text-[#4F39F6] focus:ring-[#4F39F6] border-gray-300 dark:border-slate-600 rounded flex-shrink-0"
                                    />
                                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate">
                                      {skill.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Information Tab */}
                  {activeTab === 'additional' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Column 1 */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Education Details
                            </label>
                            <Textarea
                              value={formData.educationDetails}
                              onChange={(e) =>
                                handleInputChange(
                                  'educationDetails',
                                  e.target.value,
                                )
                              }
                              placeholder="Enter education details"
                              className="min-h-[80px] text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                              rows={4}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Domain Expertise
                            </label>
                            <Input
                              type="text"
                              value={formData.domainExpertise}
                              onChange={(e) =>
                                handleInputChange(
                                  'domainExpertise',
                                  e.target.value,
                                )
                              }
                              placeholder="Enter domain (Separated by Commas)"
                              className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Passport Number
                            </label>
                            <Input
                              type="text"
                              value={formData.passportNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  'passportNumber',
                                  e.target.value,
                                )
                              }
                              placeholder="Enter passport number"
                              className="h-8 text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                            />
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Reason For Change
                            </label>
                            <Textarea
                              value={formData.reasonForChange}
                              onChange={(e) =>
                                handleInputChange(
                                  'reasonForChange',
                                  e.target.value,
                                )
                              }
                              placeholder="Enter reason for change"
                              className="min-h-[80px] text-xs dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                              rows={4}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                              Direct Interview
                            </label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={formData.directInterview}
                                onCheckedChange={(checked) =>
                                  handleInputChange('directInterview', checked)
                                }
                              />
                              <HelpCircle className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {renderResumeMatchSection()}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 mb-4">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center gap-3 pt-6 pb-6 px-4 border-t border-gray-200 dark:border-slate-700 mt-6">
                  <div className="flex gap-2">
                    {activeTab !== 'upload' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={isCreating}
                        className="h-8 text-xs flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/candidates')}
                      disabled={isCreating}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    {activeTab !== 'additional' ? (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNext();
                        }}
                        disabled={isCreating}
                        className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white flex items-center gap-1.5 h-8 text-xs"
                      >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white flex items-center gap-1.5 h-8 text-xs"
                        disabled={isCreating}
                      >
                        {isCreating ? 'Creating...' : 'Submit'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CV Upload Alert Dialog */}
      <Dialog open={showCvAlert} onOpenChange={setShowCvAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Required</DialogTitle>
            <DialogDescription>
              Please upload a CV before proceeding to the next step.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowCvAlert(false)}
              className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RegisterCandidate;
