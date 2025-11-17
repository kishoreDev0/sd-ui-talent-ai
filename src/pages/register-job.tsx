import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomSelect from '@/components/ui/custom-select';
import Breadcrumb from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  ArrowRight,
  X,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Check,
  Loader2,
  Upload,
  File,
} from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  createJobAsync,
  updateJobAsync,
  fetchJobByIdAsync,
} from '@/store';
import { useToast } from '@/components/ui/toast';
import { getAllOrganizations } from '@/store/organization/actions/organizationActions';
import { fetchJobCategories } from '@/store/jobCategory/actions/jobCategoryActions';
import { fetchMajorSkills } from '@/store/majorSkill/actions/majorSkillActions';
import { fetchSkills } from '@/store/skill/actions/skillActions';
import type { Job } from '@/store/job/types/jobTypes';
import axiosInstance from '@/axios-setup/axios-instance';

interface JobFormData {
  jobTitle: string;
  employmentType: string;
  experience: string;
  majorSkills: number[];
  selectedSkills: number[];
  organization: string;
  priority: string;
  currency: string;
  jobCategory: string;
  level: string;
  compensationRange: string;
  numberOfVacancies: string;
  jobDescription: string;
  jobResponsibilities: string;
}

const RegisterJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useUserRole();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);
  const { organizations: organizationList, loading: organizationsLoading } =
    useAppSelector((state) => state.organization);
  const { items: jobCategoryList, isLoading: jobCategoriesLoading } =
    useAppSelector((state) => state.jobCategory);
  const { items: majorSkillItems, isLoading: majorSkillsLoading } =
    useAppSelector((state) => state.majorSkill);
  const { items: skillItems, isLoading: skillsLoading } = useAppSelector(
    (state) => state.skill,
  );
  const { current: jobDataFromStore, isLoading: isLoadingJob } = useAppSelector(
    (state) => state.job,
  );
  
  // Get job from navigation state first, then from store
  const location = useLocation();
  const jobFromState = (location.state as { job?: Job })?.job;
  const jobData = jobFromState || jobDataFromStore;
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [jobRequirementFile, setJobRequirementFile] = useState<File | null>(null);
  const [jobRequirementFileLink, setJobRequirementFileLink] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    employmentType: '',
    experience: '',
    majorSkills: [],
    selectedSkills: [],
    organization: '',
    priority: 'Medium',
    currency: 'USD',
    jobCategory: '',
    level: 'Mid Level',
    compensationRange: '',
    numberOfVacancies: '',
    jobDescription: '',
    jobResponsibilities: '',
  });

  useEffect(() => {
    if (organizationList.length === 0) {
      dispatch(getAllOrganizations({ page: 1, page_size: 100 }));
    }
  }, [dispatch, organizationList.length]);

  useEffect(() => {
    if (jobCategoryList.length === 0) {
      dispatch(fetchJobCategories());
    }
  }, [dispatch, jobCategoryList.length]);

  useEffect(() => {
    if (majorSkillItems.length === 0) {
      dispatch(fetchMajorSkills());
    }
  }, [dispatch, majorSkillItems.length]);

  useEffect(() => {
    if (skillItems.length === 0) {
      dispatch(fetchSkills());
    }
  }, [dispatch, skillItems.length]);

  // Initialize TipTap editors for Description and Responsibilities
  const editorDescription = useEditor({
    extensions: [StarterKit],
    content: formData.jobDescription,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, jobDescription: editor.getHTML() }));
      if (errors.jobDescription) {
        setErrors({ ...errors, jobDescription: '' });
      }
    },
  });

  const editorResponsibilities = useEditor({
    extensions: [StarterKit],
    content: formData.jobResponsibilities,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        jobResponsibilities: editor.getHTML(),
      }));
      if (errors.jobResponsibilities) {
        setErrors({ ...errors, jobResponsibilities: '' });
      }
    },
  });

  // Load job data if in edit mode (only if not in state)
  useEffect(() => {
    const loadJobData = async () => {
      // If job data is in state, don't fetch from API
      if (jobFromState) {
        setIsLoadingInitialData(false);
        return;
      }

      if (isEditMode && id && !jobFromState) {
        setIsLoadingInitialData(true);
        try {
          const jobId = parseInt(id, 10);
          if (!isNaN(jobId)) {
            await dispatch(fetchJobByIdAsync(jobId)).unwrap();
          }
        } catch (error) {
          console.error('Failed to load job data:', error);
          showToast('Failed to load job data', 'error');
          navigate('/jobs');
        } finally {
          setIsLoadingInitialData(false);
        }
      }
    };

    loadJobData();
  }, [isEditMode, id, dispatch, navigate, showToast, jobFromState]);

  // Populate form when job data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && jobData && !isLoadingInitialData && majorSkillItems.length > 0 && skillItems.length > 0) {
      // Map job data to form data
      const experienceYears = jobData.experience_years || 0;
      const experienceText = experienceYears > 0 ? `${experienceYears} Years` : '';

      // Map major skills from names to IDs
      const majorSkillIds = jobData.major_skills
        .map((skill) => {
          const found = majorSkillItems.find((ms) => ms.name === skill.name);
          return found ? Number(found.id) : null;
        })
        .filter((id): id is number => id !== null);

      // Map skills from names to IDs
      const skillIds = jobData.skills
        .map((skill) => {
          const found = skillItems.find((s) => s.name === skill.name);
          return found ? Number(found.id) : null;
        })
        .filter((id): id is number => id !== null);

      // Format compensation range
      let compensationRange = '';
      if (jobData.compensation_from || jobData.compensation_to) {
        if (jobData.compensation_from && jobData.compensation_to) {
          compensationRange = `${jobData.compensation_from} - ${jobData.compensation_to}`;
        } else if (jobData.compensation_from) {
          compensationRange = jobData.compensation_from.toString();
        } else if (jobData.compensation_to) {
          compensationRange = jobData.compensation_to.toString();
        }
      }

      setFormData({
        jobTitle: jobData.job_title || '',
        employmentType: jobData.employment_type || '',
        experience: experienceText,
        majorSkills: majorSkillIds,
        selectedSkills: skillIds,
        organization: jobData.organization || '',
        priority: jobData.priority || 'Medium',
        currency: jobData.currency || 'USD',
        jobCategory: jobData.job_category || '',
        level: jobData.level || 'Mid Level',
        compensationRange,
        numberOfVacancies: jobData.no_of_vacancy?.toString() || '1',
        jobDescription: jobData.job_description || '',
        jobResponsibilities: jobData.job_responsibilities || '',
      });

      // Set job requirement file link if it exists
      if (jobData.job_requirement_file_link) {
        setJobRequirementFileLink(jobData.job_requirement_file_link);
      }

      // Update editors
      if (editorDescription) {
        editorDescription.commands.setContent(jobData.job_description || '');
      }
      if (editorResponsibilities) {
        editorResponsibilities.commands.setContent(jobData.job_responsibilities || '');
      }
    }
  }, [isEditMode, jobData, isLoadingInitialData, majorSkillItems, skillItems, editorDescription, editorResponsibilities]);

  const organizationOptions = useMemo(
    () =>
      organizationList
        .filter((org) => org?.name?.trim())
        .map((org) => ({
          value: org.name as string,
          label: org.name as string,
        })),
    [organizationList],
  );

  const jobCategoryOptions = useMemo(
    () =>
      jobCategoryList
        .filter((category) => category?.name?.trim())
        .map((category) => ({
          value: category.name as string,
          label: category.name as string,
        })),
    [jobCategoryList],
  );

  // Toolbar button component
  const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border-b border-gray-200 p-1 bg-gray-50 rounded-t-lg flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1 hover:bg-gray-200 rounded text-xs"
        >
          <Undo className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1 hover:bg-gray-200 rounded text-xs"
        >
          <Redo className="h-3 w-3" />
        </button>
        <div className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 hover:bg-gray-200 rounded text-xs font-bold ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 hover:bg-gray-200 rounded text-xs italic ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
        >
          I
        </button>
        <div className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-1 hover:bg-gray-200 rounded text-xs ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading1 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1 hover:bg-gray-200 rounded text-xs ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading2 className="h-3 w-3" />
        </button>
        <div className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 hover:bg-gray-200 rounded text-xs ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          <List className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 hover:bg-gray-200 rounded text-xs ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
        >
          <ListOrdered className="h-3 w-3" />
        </button>
      </div>
    );
  };

  const steps = ['Basic Information', 'Description', 'Responsibilities'];

  const employmentTypes = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Internship', label: 'Internship' },
  ];

  const experienceLevels = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: '1-2 Years', label: '1-2 Years' },
    { value: '2-4 Years', label: '2-4 Years' },
    { value: '4-6 Years', label: '4-6 Years' },
    { value: '6+ Years', label: '6+ Years' },
  ];

  const priorities = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
  ];

  const levels = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead Level', label: 'Lead Level' },
  ];

  const majorSkillOptions = useMemo(
    () =>
      majorSkillItems
        .map((item) => {
          const id = Number(item.id);
          const name = item.name?.trim();
          if (!Number.isFinite(id) || !name) {
            return null;
          }
          return { id, name };
        })
        .filter((item): item is { id: number; name: string } => Boolean(item)),
    [majorSkillItems],
  );

  const skillOptions = useMemo(
    () =>
      skillItems
        .map((item) => {
          const id = Number(item.id);
          const name = item.name?.trim();
          const majorSkillId = Number(item.major_skill_id);
          if (!Number.isFinite(id) || !name || !Number.isFinite(majorSkillId)) {
            return null;
          }
          return { id, name, majorSkillId };
        })
        .filter(
          (item): item is { id: number; name: string; majorSkillId: number } =>
            Boolean(item),
        ),
    [skillItems],
  );

  const filteredSkills = useMemo(() => {
    if (formData.majorSkills.length === 0) {
      return [];
    }
    const majorSet = new Set(formData.majorSkills);
    return skillOptions.filter((skill) => majorSet.has(skill.majorSkillId));
  }, [skillOptions, formData.majorSkills]);

  const skillNameMap = useMemo(() => {
    const map = new Map<number, string>();
    skillOptions.forEach((skill) => {
      map.set(skill.id, skill.name);
    });
    return map;
  }, [skillOptions]);

  const allMajorSelected =
    majorSkillOptions.length > 0 &&
    majorSkillOptions.every((item) => formData.majorSkills.includes(item.id));

  const allSkillsSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((item) => formData.selectedSkills.includes(item.id));

  const handleInputChange = <K extends keyof JobFormData>(
    field: K,
    value: JobFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMajorSkill = (id: number) => {
    setFormData((prev) => {
      const exists = prev.majorSkills.includes(id);
      const nextMajorSkills = exists
        ? prev.majorSkills.filter((item) => item !== id)
        : [...prev.majorSkills, id];

      const allowedSkillIds =
        nextMajorSkills.length === 0
          ? new Set<number>()
          : new Set(
              skillOptions
                .filter((skill) => nextMajorSkills.includes(skill.majorSkillId))
                .map((skill) => skill.id),
            );

      const filteredSelectedSkills = prev.selectedSkills.filter((skillId) =>
        allowedSkillIds.has(skillId),
      );

      return {
        ...prev,
        majorSkills: nextMajorSkills,
        selectedSkills: filteredSelectedSkills,
      };
    });

    if (errors.majorSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, majorSkills: '' }));
    }
    if (errors.selectedSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, selectedSkills: '' }));
    }
  };

  const toggleAllMajorSkills = () => {
    if (majorSkillOptions.length === 0) {
      return;
    }

    setFormData((prev) => {
      if (allMajorSelected) {
        return { ...prev, majorSkills: [], selectedSkills: [] };
      }

      const allIds = majorSkillOptions.map((item) => item.id);
      return {
        ...prev,
        majorSkills: allIds,
        selectedSkills: prev.selectedSkills.filter((skillId) =>
          skillOptions.some(
            (skill) =>
              skill.id === skillId && allIds.includes(skill.majorSkillId),
          ),
        ),
      };
    });

    if (errors.majorSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, majorSkills: '' }));
    }
    if (errors.selectedSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, selectedSkills: '' }));
    }
  };

  const toggleSkill = (id: number) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.includes(id);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((item) => item !== id)
          : [...prev.selectedSkills, id],
      };
    });

    if (errors.selectedSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, selectedSkills: '' }));
    }
  };

  const toggleAllSkills = () => {
    if (filteredSkills.length === 0) {
      return;
    }

    const filteredIds = filteredSkills.map((skill) => skill.id);
    setFormData((prev) => {
      const areAllSelected = filteredIds.every((id) =>
        prev.selectedSkills.includes(id),
      );
      const nextSelected = areAllSelected
        ? prev.selectedSkills.filter((id) => !filteredIds.includes(id))
        : Array.from(new Set([...prev.selectedSkills, ...filteredIds]));
      return { ...prev, selectedSkills: nextSelected };
    });

    if (errors.selectedSkills) {
      setErrors((prevErrors) => ({ ...prevErrors, selectedSkills: '' }));
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((id) => id !== skillId),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Validate Basic Information
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Job Title is required';
      }
      if (!formData.employmentType) {
        newErrors.employmentType = 'Employment Type is required';
      }
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
      }
      if (formData.majorSkills.length === 0) {
        newErrors.majorSkills = 'At least one major skill is required';
      }
      if (!formData.organization) {
        newErrors.organization = 'Organization is required';
      }
      if (!formData.currency) {
        newErrors.currency = 'Currency is required';
      }
      if (!formData.jobCategory) {
        newErrors.jobCategory = 'Job Category is required';
      }
      if (
        formData.majorSkills.length > 0 &&
        formData.selectedSkills.length === 0
      ) {
        newErrors.selectedSkills = 'At least one skill is required';
      }
    } else if (step === 1) {
      // Validate Description - check if editor has text content
      if (editorDescription) {
        const textContent = editorDescription.getText().trim();
        if (!textContent) {
          newErrors.jobDescription = 'Job Description is required';
        }
      } else if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = 'Job Description is required';
      }
    } else if (step === 2) {
      // Validate Responsibilities - check if editor has text content
      if (editorResponsibilities) {
        const textContent = editorResponsibilities.getText().trim();
        if (!textContent) {
          newErrors.jobResponsibilities = 'Job Responsibilities is required';
        }
      } else if (!formData.jobResponsibilities.trim()) {
        newErrors.jobResponsibilities = 'Job Responsibilities is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setErrors({}); // Clear errors when moving to next step
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Clear errors when going back
    }
  };

  const handleStepClick = (targetStep: number) => {
    // Allow navigation to previous or current steps without validation
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      setErrors({});
      return;
    }

    // For future steps, validate current step first
    if (validateStep(currentStep)) {
      setCurrentStep(targetStep);
      setErrors({});
    }
    // If validation fails, errors are already set and user stays on current step
  };

  const parseExperienceYears = (value: string) => {
    const matches = value.match(/\d+/g);
    if (!matches || matches.length === 0) {
      return 0;
    }
    return Math.max(...matches.map((match) => Number(match)));
  };

  const parseCompensationRange = (
    value: string,
  ): [number | null, number | null] => {
    if (!value) {
      return [null, null];
    }
    const matches = value
      .match(/[\d,.]+/g)
      ?.map((match) => Number(match.replace(/,/g, '')))
      .filter((num) => !Number.isNaN(num));

    if (!matches || matches.length === 0) {
      return [null, null];
    }

    if (matches.length === 1) {
      return [matches[0], null];
    }

    return [matches[0], matches[1]];
  };

  const parseVacancies = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return 1;
    }
    return parsed;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const majorSkillNames = formData.majorSkills
      .map((id) => majorSkillOptions.find((item) => item.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    const skillNames = formData.selectedSkills
      .map((id) => skillNameMap.get(id))
      .filter((name): name is string => Boolean(name));

    const [compFrom, compTo] = parseCompensationRange(
      formData.compensationRange,
    );

    const payload = {
      job_title: formData.jobTitle.trim(),
      organization: formData.organization,
      job_category: formData.jobCategory,
      employment_type: formData.employmentType || null,
      priority: formData.priority || null,
      level: formData.level || null,
      experience_years: parseExperienceYears(formData.experience),
      currency: formData.currency || null,
      compensation_from: compFrom,
      compensation_to: compTo,
      no_of_vacancy: parseVacancies(formData.numberOfVacancies),
      major_skills: majorSkillNames,
      skills: skillNames,
      job_description: formData.jobDescription,
      job_responsibilities: formData.jobResponsibilities || null,
    };

    setIsSubmitting(true);
    try {
      // Upload job requirement file if a new file is selected
      let fileLink = jobRequirementFileLink;
      if (jobRequirementFile) {
        setIsUploadingFile(true);
        try {
          // Upload file to S3 first
          const uploadFormData = new FormData();
          uploadFormData.append('file', jobRequirementFile);
          
          const uploadResponse = await axiosInstance.post<{
            data: { result: { file_link: string } };
          }>('/api/v1/job/upload-requirement-file', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          fileLink = uploadResponse.data.data.result.file_link || null;
          setJobRequirementFileLink(fileLink);
        } catch (uploadError: unknown) {
          console.error('Failed to upload file:', uploadError);
          let errorMessage = 'Failed to upload job requirement file';
          if (uploadError && typeof uploadError === 'object' && 'response' in uploadError) {
            const axiosError = uploadError as { response?: { data?: { detail?: string; message?: string } } };
            errorMessage = axiosError.response?.data?.detail || axiosError.response?.data?.message || errorMessage;
          } else if (uploadError instanceof Error) {
            errorMessage = uploadError.message;
          }
          showToast(errorMessage, 'error');
          setIsUploadingFile(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingFile(false);
        }
      }

      // Add file link to payload
      const finalPayload = {
        ...payload,
        job_requirement_file_link: fileLink || null,
      };

      if (isEditMode && id) {
        const jobId = parseInt(id, 10);
        if (isNaN(jobId)) {
          throw new Error('Invalid job ID');
        }
        await dispatch(updateJobAsync({ id: jobId, ...finalPayload })).unwrap();
        showToast('Job updated successfully', 'success');
      } else {
        await dispatch(createJobAsync(finalPayload)).unwrap();
        showToast('Job created successfully', 'success');
      }
      navigate('/jobs');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : isEditMode
              ? 'Failed to update job'
              : 'Failed to create job';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => {
              handleInputChange('jobTitle', e.target.value);
              if (errors.jobTitle) {
                setErrors({ ...errors, jobTitle: '' });
              }
            }}
            placeholder="Enter job title"
            className={`w-full ${errors.jobTitle ? 'border-red-500' : ''}`}
          />
          {errors.jobTitle && (
            <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.employmentType}
            onChange={(value) => {
              handleInputChange('employmentType', value);
              if (errors.employmentType) {
                setErrors({ ...errors, employmentType: '' });
              }
            }}
            options={employmentTypes}
            placeholder="Select Type"
            className={`w-full ${errors.employmentType ? 'border-red-500' : ''}`}
          />
          {errors.employmentType && (
            <p className="text-xs text-red-500 mt-1">{errors.employmentType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.experience}
            onChange={(value) => {
              handleInputChange('experience', value);
              if (errors.experience) {
                setErrors({ ...errors, experience: '' });
              }
            }}
            options={experienceLevels}
            placeholder="Select Experience"
            className={`w-full ${errors.experience ? 'border-red-500' : ''}`}
          />
          {errors.experience && (
            <p className="text-xs text-red-500 mt-1">{errors.experience}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.organization}
            onChange={(value) => {
              handleInputChange('organization', value);
              if (errors.organization) {
                setErrors({ ...errors, organization: '' });
              }
            }}
            options={organizationOptions}
            placeholder={
              organizationsLoading && organizationOptions.length === 0
                ? 'Loading organizations...'
                : 'Select Organization'
            }
            emptyMessage="No organizations available"
            className={`w-full ${errors.organization ? 'border-red-500' : ''}`}
          />
          {errors.organization && (
            <p className="text-xs text-red-500 mt-1">{errors.organization}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <CustomSelect
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value)}
            options={priorities}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.currency}
            onChange={(value) => {
              handleInputChange('currency', value);
              if (errors.currency) {
                setErrors({ ...errors, currency: '' });
              }
            }}
            options={currencies}
            className={`w-full ${errors.currency ? 'border-red-500' : ''}`}
          />
          {errors.currency && (
            <p className="text-xs text-red-500 mt-1">{errors.currency}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Category <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={formData.jobCategory}
            onChange={(value) => {
              handleInputChange('jobCategory', value);
              if (errors.jobCategory) {
                setErrors({ ...errors, jobCategory: '' });
              }
            }}
            options={jobCategoryOptions}
            placeholder={
              jobCategoriesLoading && jobCategoryOptions.length === 0
                ? 'Loading job categories...'
                : 'Select Job Category'
            }
            emptyMessage="No job categories available"
            className={`w-full ${errors.jobCategory ? 'border-red-500' : ''}`}
          />
          {errors.jobCategory && (
            <p className="text-xs text-red-500 mt-1">{errors.jobCategory}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <CustomSelect
            value={formData.level}
            onChange={(value) => handleInputChange('level', value)}
            options={levels}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compensation Range
          </label>
          <Input
            type="text"
            value={formData.compensationRange}
            onChange={(e) =>
              handleInputChange('compensationRange', e.target.value)
            }
            placeholder="e.g., $50,000 - $80,000"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Vacancies <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.numberOfVacancies}
            onChange={(e) =>
              handleInputChange('numberOfVacancies', e.target.value)
            }
            placeholder="Enter number of vacancies"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Major Skills <span className="text-red-500">*</span>
            </span>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={allMajorSelected}
                onChange={toggleAllMajorSkills}
                className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
              />
              Select All
            </label>
          </div>
          <div
            className={`rounded-lg border ${
              errors.majorSkills ? 'border-red-500' : 'border-gray-200'
            } bg-white shadow-sm`}
          >
            {majorSkillsLoading && majorSkillOptions.length === 0 ? (
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#4F39F6]" />
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                {majorSkillOptions.length > 0 ? (
                  majorSkillOptions.map((item) => {
                    const isChecked = formData.majorSkills.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium ${
                          isChecked
                            ? 'bg-indigo-50 text-[#4F39F6]'
                            : 'text-gray-700'
                        } hover:bg-indigo-50`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMajorSkill(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-gray-500">
                    No major skills available
                  </p>
                )}
              </div>
            )}
          </div>
          {errors.majorSkills && (
            <p className="mt-1 text-xs text-red-500">{errors.majorSkills}</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Skills <span className="text-red-500">*</span>
            </span>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={allSkillsSelected}
                onChange={toggleAllSkills}
                className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
              />
              Select All
            </label>
          </div>
          <div
            className={`rounded-lg border ${
              errors.selectedSkills ? 'border-red-500' : 'border-gray-200'
            } bg-white shadow-sm`}
          >
            {skillsLoading && filteredSkills.length === 0 ? (
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#4F39F6]" />
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => {
                    const isChecked = formData.selectedSkills.includes(
                      skill.id,
                    );
                    return (
                      <label
                        key={skill.id}
                        className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium ${
                          isChecked
                            ? 'bg-indigo-50 text-[#4F39F6]'
                            : 'text-gray-700'
                        } hover:bg-indigo-50`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkill(skill.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                        />
                        <span className="flex-1 truncate">{skill.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-gray-500">
                    {formData.majorSkills.length === 0
                      ? 'Select a major skill to view related skills'
                      : 'No skills available for the selected major skills'}
                  </p>
                )}
              </div>
            )}
          </div>
          {errors.selectedSkills && (
            <p className="mt-1 text-xs text-red-500">{errors.selectedSkills}</p>
          )}
        </div>
      </div>

      {formData.selectedSkills.length > 0 && (
        <div className="mt-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Selected Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.selectedSkills.map((skillId) => (
              <span
                key={skillId}
                className="inline-flex items-center gap-2 rounded-full bg-[#F2EEFF] px-3 py-1 text-sm font-medium text-[#4F39F6]"
              >
                {skillNameMap.get(skillId) ?? `Skill ${skillId}`}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skillId)}
                  className="rounded-full p-0.5 hover:bg-[#E5DCFF]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDescription = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <div
          className={`border ${errors.jobDescription ? 'border-red-500' : 'border-gray-200'} rounded-lg overflow-hidden`}
        >
          <MenuBar editor={editorDescription} />
          <div className="prose max-w-none p-3">
            <EditorContent editor={editorDescription} />
          </div>
        </div>
        {errors.jobDescription && (
          <p className="text-xs text-red-500 mt-1">{errors.jobDescription}</p>
        )}
      </div>
    </div>
  );

  const renderResponsibilities = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Responsibilities <span className="text-red-500">*</span>
        </label>
        <div
          className={`border ${errors.jobResponsibilities ? 'border-red-500' : 'border-gray-200'} rounded-lg overflow-hidden`}
        >
          <MenuBar editor={editorResponsibilities} />
          <div className="prose max-w-none p-3">
            <EditorContent editor={editorResponsibilities} />
          </div>
        </div>
        {errors.jobResponsibilities && (
          <p className="text-xs text-red-500 mt-1">
            {errors.jobResponsibilities}
          </p>
        )}
      </div>

      {/* Job Requirement File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Requirement File (Optional)
        </label>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file type
                const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                if (!['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
                  showToast('Please upload a PDF, DOC, or DOCX file', 'error');
                  return;
                }
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                  showToast('File size must be less than 10MB', 'error');
                  return;
                }
                setJobRequirementFile(file);
                setJobRequirementFileLink(null); // Clear existing link when new file is selected
                if (errors.jobRequirementFile) {
                  setErrors({ ...errors, jobRequirementFile: '' });
                }
              }
            }}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {jobRequirementFile ? 'Change File' : 'Upload File'}
            </Button>
            {jobRequirementFile && (
              <div className="flex items-center gap-2 flex-1">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">{jobRequirementFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setJobRequirementFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {jobRequirementFileLink && !jobRequirementFile && (
              <div className="flex items-center gap-2 flex-1">
                <File className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 truncate">File already uploaded</span>
                <a
                  href={jobRequirementFileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4F39F6] hover:text-[#3D2DC4] text-sm"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setJobRequirementFileLink(null);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
          {errors.jobRequirementFile && (
            <p className="text-xs text-red-500">{errors.jobRequirementFile}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50">
        <div
          className="max-w-5xl mx-auto px-8 py-3
"
        >
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Job Board', href: '/job-board' },
              { label: isEditMode ? 'Edit Job' : 'Register Job' },
            ]}
          />

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {isEditMode ? 'Edit Job' : 'Register Job'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode
                ? 'Update job posting details.'
                : 'Create a new job posting.'}
            </p>
          </div>

          {/* Loading state when fetching job data */}
          {(isLoadingInitialData || (isEditMode && isLoadingJob)) && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#4F39F6]" />
              <span className="ml-2 text-sm text-gray-600">
                Loading job data...
              </span>
            </div>
          )}

          {/* Form Content - Hide when loading */}
          {!(isLoadingInitialData || (isEditMode && isLoadingJob)) && (
            <>
              {/* Stepper */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      {/* Step Circle */}
                      <div className="relative flex flex-col items-center">
                        <button
                          onClick={() => handleStepClick(index)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                            currentStep === index
                              ? 'bg-[#4F39F6] border-[#4F39F6] text-white'
                              : index < currentStep
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-300 text-gray-500 cursor-pointer'
                          }`}
                        >
                          {index < currentStep ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </button>
                        {/* Step Label */}
                        <span
                          className={`mt-2 text-xs font-medium ${
                            currentStep === index
                              ? 'text-[#4F39F6]'
                              : index < currentStep
                                ? 'text-green-600'
                                : 'text-gray-500'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`w-24 h-0.5 mx-4 -mt-5 ${
                            index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            {currentStep === 0 && renderBasicInformation()}
            {currentStep === 1 && renderDescription()}
            {currentStep === 2 && renderResponsibilities()}

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => navigate('/job-board')}>
                Cancel
              </Button>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Job' : 'Submit Job'
                  )}
                </Button>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterJob;
