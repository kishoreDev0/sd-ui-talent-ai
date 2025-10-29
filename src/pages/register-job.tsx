import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomSelect from '@/components/ui/custom-select';
import Breadcrumb from '@/components/ui/breadcrumb';
import { ArrowLeft, ArrowRight, X, List, ListOrdered, Heading1, Heading2, Undo, Redo } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
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
    jobResponsibilities: ''
  });

  // Mock skills database filtered by major skill
  const getSkillsByMajorSkill = (majorSkill: string): { value: string; label: string }[] => {
    const skillsMap: Record<string, { value: string; label: string }[]> = {
      'Web Development': [
        { value: 'React', label: 'React' },
        { value: 'Vue.js', label: 'Vue.js' },
        { value: 'Angular', label: 'Angular' },
        { value: 'Node.js', label: 'Node.js' },
        { value: 'Express', label: 'Express' },
        { value: 'TypeScript', label: 'TypeScript' },
        { value: 'JavaScript', label: 'JavaScript' },
        { value: 'HTML/CSS', label: 'HTML/CSS' }
      ],
      'Mobile Development': [
        { value: 'iOS', label: 'iOS' },
        { value: 'Android', label: 'Android' },
        { value: 'React Native', label: 'React Native' },
        { value: 'Flutter', label: 'Flutter' },
        { value: 'Swift', label: 'Swift' },
        { value: 'Kotlin', label: 'Kotlin' },
        { value: 'Java', label: 'Java' }
      ],
      'UI/UX Design': [
        { value: 'Figma', label: 'Figma' },
        { value: 'Adobe XD', label: 'Adobe XD' },
        { value: 'Sketch', label: 'Sketch' },
        { value: 'InVision', label: 'InVision' },
        { value: 'Prototyping', label: 'Prototyping' },
        { value: 'User Research', label: 'User Research' },
        { value: 'Wireframing', label: 'Wireframing' }
      ],
      'Data Science': [
        { value: 'Python', label: 'Python' },
        { value: 'R', label: 'R' },
        { value: 'SQL', label: 'SQL' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Data Visualization', label: 'Data Visualization' },
        { value: 'Pandas', label: 'Pandas' }
      ],
      'DevOps': [
        { value: 'Docker', label: 'Docker' },
        { value: 'Kubernetes', label: 'Kubernetes' },
        { value: 'AWS', label: 'AWS' },
        { value: 'CI/CD', label: 'CI/CD' },
        { value: 'Jenkins', label: 'Jenkins' }
      ],
      'Machine Learning': [
        { value: 'TensorFlow', label: 'TensorFlow' },
        { value: 'PyTorch', label: 'PyTorch' },
        { value: 'Scikit-learn', label: 'Scikit-learn' },
        { value: 'Deep Learning', label: 'Deep Learning' }
      ]
    };
    return skillsMap[majorSkill] || [];
  };

  const availableSkills = getSkillsByMajorSkill(formData.majorSkill);

  // Initialize TipTap editors for Description and Responsibilities
  const editorDescription = useEditor({
    extensions: [StarterKit],
    content: formData.jobDescription,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, jobDescription: editor.getHTML() }));
    },
  });

  const editorResponsibilities = useEditor({
    extensions: [StarterKit],
    content: formData.jobResponsibilities,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, jobResponsibilities: editor.getHTML() }));
    },
  });

  // Toolbar button component
  const MenuBar = ({ editor }: { editor: any }) => {
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 hover:bg-gray-200 rounded text-xs ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          }`}
        >
          <Heading1 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
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
    { value: 'Internship', label: 'Internship' }
  ];

  const experienceLevels = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: '1-2 Years', label: '1-2 Years' },
    { value: '2-4 Years', label: '2-4 Years' },
    { value: '4-6 Years', label: '4-6 Years' },
    { value: '6+ Years', label: '6+ Years' }
  ];

  const majorSkillsOptions = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Machine Learning', label: 'Machine Learning' }
  ];

  const organizations = [
    { value: 'Tech Corp', label: 'Tech Corp' },
    { value: 'Design Studio', label: 'Design Studio' },
    { value: 'Startup Inc', label: 'Startup Inc' },
    { value: 'Global Solutions', label: 'Global Solutions' },
    { value: 'Creative Agency', label: 'Creative Agency' }
  ];

  const priorities = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' }
  ];

  const jobCategories = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' }
  ];

  const levels = [
    { value: 'Entry Level', label: 'Entry Level' },
    { value: 'Mid Level', label: 'Mid Level' },
    { value: 'Senior Level', label: 'Senior Level' },
    { value: 'Lead Level', label: 'Lead Level' }
  ];

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear selected skills when major skill changes
    if (field === 'majorSkill') {
      setFormData(prev => ({ ...prev, selectedSkills: [] }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedSkills.includes(skill);
      if (isSelected) {
        return { ...prev, selectedSkills: prev.selectedSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, selectedSkills: [...prev.selectedSkills, skill] };
      }
    });
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(s => s !== skill)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Job Registration Data:', formData);
    // Here you would typically send the data to your backend
    navigate('/job-board');
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
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            placeholder="Enter job title"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Type *
          </label>
          <CustomSelect
            value={formData.employmentType}
            onChange={(value) => handleInputChange('employmentType', value)}
            options={employmentTypes}
            placeholder="Select Type"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience *
          </label>
          <CustomSelect
            value={formData.experience}
            onChange={(value) => handleInputChange('experience', value)}
            options={experienceLevels}
            placeholder="Select Experience"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Skills *
          </label>
          <CustomSelect
            value={formData.majorSkill}
            onChange={(value) => handleInputChange('majorSkill', value)}
            options={majorSkillsOptions}
            placeholder="Select Major Skill"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization *
          </label>
          <CustomSelect
            value={formData.organization}
            onChange={(value) => handleInputChange('organization', value)}
            options={organizations}
            placeholder="Select Organization"
            className="w-full"
          />
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
            onChange={(value) => handleInputChange('currency', value)}
            options={currencies}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Category *
          </label>
          <CustomSelect
            value={formData.jobCategory}
            onChange={(value) => handleInputChange('jobCategory', value)}
            options={jobCategories}
            placeholder="Select Category"
            className="w-full"
          />
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
            onChange={(e) => handleInputChange('compensationRange', e.target.value)}
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
            onChange={(e) => handleInputChange('numberOfVacancies', e.target.value)}
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
          <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto">
            {availableSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  const isSelected = formData.selectedSkills.includes(skill.value);
                  return (
                    <button
                      key={skill.value}
                      type="button"
                      onClick={() => handleSkillToggle(skill.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills available for this major skill</p>
            )}
          </div>
          
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
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
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
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <MenuBar editor={editorDescription} />
          <div className="prose max-w-none p-3">
            <EditorContent editor={editorDescription} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderResponsibilities = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Responsibilities *
        </label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <MenuBar editor={editorResponsibilities} />
          <div className="prose max-w-none p-3">
            <EditorContent editor={editorResponsibilities} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout role="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-8 py-3
">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Job Board', href: '/job-board' },
              { label: 'Register Job' }
            ]} 
          />

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Register Job</h1>
            <p className="text-sm text-gray-600">Create a new job posting.</p>
          </div>

          {/* Steps */}
          <div className="mb-4">
            <div className="flex space-x-6">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    currentStep === index
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            {currentStep === 0 && renderBasicInformation()}
            {currentStep === 1 && renderDescription()}
            {currentStep === 2 && renderResponsibilities()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <div>
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
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/job-board')}
                >
                  Cancel
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Submit Job
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterJob;
