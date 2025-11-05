import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

interface JobFormData {
  jobTitle: string;
  employmentType: string;
  experience: string;
  majorSkill: string;
  selectedSkills: string[];
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
  const role = useUserRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    employmentType: '',
    experience: '',
    majorSkill: '',
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

  // Mock skills database filtered by major skill
  const getSkillsByMajorSkill = (
    majorSkill: string,
  ): { value: string; label: string }[] => {
    const skillsMap: Record<string, { value: string; label: string }[]> = {
      'Web Development': [
        { value: 'React', label: 'React' },
        { value: 'Vue.js', label: 'Vue.js' },
        { value: 'Angular', label: 'Angular' },
        { value: 'Node.js', label: 'Node.js' },
        { value: 'Express', label: 'Express' },
        { value: 'TypeScript', label: 'TypeScript' },
        { value: 'JavaScript', label: 'JavaScript' },
        { value: 'HTML/CSS', label: 'HTML/CSS' },
      ],
      'Mobile Development': [
        { value: 'iOS', label: 'iOS' },
        { value: 'Android', label: 'Android' },
        { value: 'React Native', label: 'React Native' },
        { value: 'Flutter', label: 'Flutter' },
        { value: 'Swift', label: 'Swift' },
        { value: 'Kotlin', label: 'Kotlin' },
        { value: 'Java', label: 'Java' },
      ],
      'UI/UX Design': [
        { value: 'Figma', label: 'Figma' },
        { value: 'Adobe XD', label: 'Adobe XD' },
        { value: 'Sketch', label: 'Sketch' },
        { value: 'InVision', label: 'InVision' },
        { value: 'Prototyping', label: 'Prototyping' },
        { value: 'User Research', label: 'User Research' },
        { value: 'Wireframing', label: 'Wireframing' },
      ],
      'Data Science': [
        { value: 'Python', label: 'Python' },
        { value: 'R', label: 'R' },
        { value: 'SQL', label: 'SQL' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Data Visualization', label: 'Data Visualization' },
        { value: 'Pandas', label: 'Pandas' },
      ],
      DevOps: [
        { value: 'Docker', label: 'Docker' },
        { value: 'Kubernetes', label: 'Kubernetes' },
        { value: 'AWS', label: 'AWS' },
        { value: 'CI/CD', label: 'CI/CD' },
        { value: 'Jenkins', label: 'Jenkins' },
      ],
      'Machine Learning': [
        { value: 'TensorFlow', label: 'TensorFlow' },
        { value: 'PyTorch', label: 'PyTorch' },
        { value: 'Scikit-learn', label: 'Scikit-learn' },
        { value: 'Deep Learning', label: 'Deep Learning' },
      ],
    };
    return skillsMap[majorSkill] || [];
  };

  const availableSkills = getSkillsByMajorSkill(formData.majorSkill);

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

  const majorSkillsOptions = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Machine Learning', label: 'Machine Learning' },
  ];

  const organizations = [
    { value: 'Tech Corp', label: 'Tech Corp' },
    { value: 'Design Studio', label: 'Design Studio' },
    { value: 'Startup Inc', label: 'Startup Inc' },
    { value: 'Global Solutions', label: 'Global Solutions' },
    { value: 'Creative Agency', label: 'Creative Agency' },
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

  const jobCategories = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' },
  ];

  const levels = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead Level', label: 'Lead Level' },
  ];

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear selected skills when major skill changes
    if (field === 'majorSkill') {
      setFormData((prev) => ({ ...prev, selectedSkills: [] }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedSkills.includes(skill);
      if (isSelected) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter((s) => s !== skill),
        };
      } else {
        return { ...prev, selectedSkills: [...prev.selectedSkills, skill] };
      }
    });
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((s) => s !== skill),
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
      if (!formData.majorSkill) {
        newErrors.majorSkill = 'Major Skill is required';
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
      if (formData.majorSkill && formData.selectedSkills.length === 0) {
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

  const handleSubmit = () => {
    // Validate final step before submitting
    if (validateStep(currentStep)) {
      console.log('Job Registration Data:', formData);
      // Here you would typically send the data to your backend
      navigate('/job-board');
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
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
            Employment Type *
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
            Experience *
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
            Major Skills *
          </label>
          <CustomSelect
            value={formData.majorSkill}
            onChange={(value) => {
              handleInputChange('majorSkill', value);
              if (errors.majorSkill) {
                setErrors({ ...errors, majorSkill: '' });
              }
            }}
            options={majorSkillsOptions}
            placeholder="Select Major Skill"
            className={`w-full ${errors.majorSkill ? 'border-red-500' : ''}`}
          />
          {errors.majorSkill && (
            <p className="text-xs text-red-500 mt-1">{errors.majorSkill}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization *
          </label>
          <CustomSelect
            value={formData.organization}
            onChange={(value) => {
              handleInputChange('organization', value);
              if (errors.organization) {
                setErrors({ ...errors, organization: '' });
              }
            }}
            options={organizations}
            placeholder="Select Organization"
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
            Currency *
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
            Job Category *
          </label>
          <CustomSelect
            value={formData.jobCategory}
            onChange={(value) => {
              handleInputChange('jobCategory', value);
              if (errors.jobCategory) {
                setErrors({ ...errors, jobCategory: '' });
              }
            }}
            options={jobCategories}
            placeholder="Select Category"
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
            Number of Vacancies
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

      {/* Skills Multi-Select - Only show when major skill is selected */}
      {formData.majorSkill && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills *
          </label>
          <div
            className={`border ${errors.selectedSkills ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 max-h-48 overflow-y-auto`}
          >
            {availableSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  const isSelected = formData.selectedSkills.includes(
                    skill.value,
                  );
                  return (
                    <button
                      key={skill.value}
                      type="button"
                      onClick={() => {
                        handleSkillToggle(skill.value);
                        if (errors.selectedSkills) {
                          setErrors({ ...errors, selectedSkills: '' });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#4F39F6] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No skills available for this major skill
              </p>
            )}
          </div>
          {errors.selectedSkills && (
            <p className="text-xs text-red-500 mt-1">{errors.selectedSkills}</p>
          )}

          {/* Selected Skills */}
          {formData.selectedSkills.length > 0 && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-[#4F39F6] rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-primary-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDescription = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
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
          Job Responsibilities *
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
              { label: 'Register Job' },
            ]}
          />

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Register Job
            </h1>
            <p className="text-sm text-gray-600">Create a new job posting.</p>
          </div>

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
                  className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                >
                  Submit Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterJob;
