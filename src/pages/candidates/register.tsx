import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomSelect from '@/components/ui/custom-select';
import Breadcrumb from '@/components/ui/breadcrumb';
import { X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

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
  rating: number;
  skypeID: string;
  source: string;
  noticePeriod: string;
}

const RegisterCandidate: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    rating: 50,
    skypeID: '',
    source: '',
    noticePeriod: '',
  });

  const countries = [
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'India', label: 'India' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
  ];

  const timeZones = [
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'IST', label: 'Indian Standard Time (IST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' },
  ];

  const organizations = [
    { value: 'Tringapps Research Labs Pvt. Ltd.', label: 'Tringapps Research Labs Pvt. Ltd.' },
    { value: 'Tringapps - BU2', label: 'Tringapps - BU2' },
  ];

  const majorSkillsOptions = [
    { value: 'Problem Solving', label: 'Problem Solving' },
    { value: 'Selling', label: 'Selling' },
    { value: 'Communication', label: 'Communication' },
    { value: 'Leadership', label: 'Leadership' },
    { value: 'Technical Skills', label: 'Technical Skills' },
  ];

  const skillsOptions = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'React', label: 'React' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Java', label: 'Java' },
    { value: 'SQL', label: 'SQL' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Docker', label: 'Docker' },
  ];

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

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' },
  ];

  const handleInputChange = (field: keyof CandidateFormData, value: string | boolean | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleOrganizationToggle = (org: string) => {
    setFormData(prev => {
      const isSelected = prev.organization.includes(org);
      return {
        ...prev,
        organization: isSelected
          ? prev.organization.filter(o => o !== org)
          : [...prev.organization, org]
      };
    });
    if (errors.organization) {
      setErrors({ ...errors, organization: '' });
    }
  };

  const handleMajorSkillToggle = (skill: string) => {
    setFormData(prev => {
      const isSelected = prev.majorSkills.includes(skill);
      return {
        ...prev,
        majorSkills: isSelected
          ? prev.majorSkills.filter(s => s !== skill)
          : [...prev.majorSkills, skill]
      };
    });
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const isSelected = prev.skills.includes(skill);
      return {
        ...prev,
        skills: isSelected
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
      };
    });
  };

  const handleSelectAll = () => {
    if (formData.skills.length === skillsOptions.length) {
      setFormData(prev => ({ ...prev, skills: [] }));
    } else {
      setFormData(prev => ({ ...prev, skills: skillsOptions.map(s => s.value) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
    }

    if (formData.organization.length === 0) {
      newErrors.organization = 'At least one organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Candidate Registered:', formData);
      navigate('/candidates');
    }
  };

  return (
    <MainLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Candidates', href: '/candidates' },
              { label: 'Register Candidate' }
            ]}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Register Candidate</h1>
                <p className="text-sm text-gray-600 mt-1">Add a new candidate to the system</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/candidates')}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Resume Title
                    </label>
                    <Input
                      type="text"
                      value={formData.resumeTitle}
                      onChange={(e) => handleInputChange('resumeTitle', e.target.value)}
                      placeholder="Enter resume title"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      User Name (Email) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter Email"
                      className={`h-9 text-sm ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.country}
                      onChange={(value) => handleInputChange('country', value)}
                      options={countries}
                      placeholder="Select Country"
                      className={`w-full ${errors.country ? 'border-red-500' : ''}`}
                    />
                    {errors.country && (
                      <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-2">
                      {organizations.map((org) => (
                        <label
                          key={org.value}
                          className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.organization.includes(org.value)}
                            onChange={() => handleOrganizationToggle(org.value)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{org.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.organization && (
                      <p className="text-xs text-red-500 mt-1">{errors.organization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Education Details
                    </label>
                    <Input
                      type="text"
                      value={formData.educationDetails}
                      onChange={(e) => handleInputChange('educationDetails', e.target.value)}
                      placeholder="Enter education details"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Domain Expertise
                    </label>
                    <Input
                      type="text"
                      value={formData.domainExpertise}
                      onChange={(e) => handleInputChange('domainExpertise', e.target.value)}
                      placeholder="Enter domain (Separated by Commas)"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Number
                    </label>
                    <Input
                      type="text"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      placeholder="Enter passport number"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current CTC (P.A)
                    </label>
                    <Input
                      type="text"
                      value={formData.currentCTC}
                      onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                      placeholder="Enter current CTC"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={`h-9 text-sm ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address 1
                    </label>
                    <Input
                      type="text"
                      value={formData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value)}
                      placeholder="Enter address"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <Input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Preferred Time Zone <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.preferredTimeZone}
                      onChange={(value) => handleInputChange('preferredTimeZone', value)}
                      options={timeZones}
                      placeholder="Select Time Zone"
                      className={`w-full ${errors.preferredTimeZone ? 'border-red-500' : ''}`}
                    />
                    {errors.preferredTimeZone && (
                      <p className="text-xs text-red-500 mt-1">{errors.preferredTimeZone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Major Skills
                    </label>
                    <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                      <div className="space-y-1.5">
                        {majorSkillsOptions.map((skill) => (
                          <label
                            key={skill.value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.majorSkills.includes(skill.value)}
                              onChange={() => handleMajorSkillToggle(skill.value)}
                              className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-700">{skill.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current Company
                    </label>
                    <Input
                      type="text"
                      value={formData.currentCompany}
                      onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                      placeholder="Enter current company"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reason For Change
                    </label>
                    <Input
                      type="text"
                      value={formData.reasonForChange}
                      onChange={(e) => handleInputChange('reasonForChange', e.target.value)}
                      placeholder="Enter reason"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Exp (Yrs)
                    </label>
                    <CustomSelect
                      value={formData.experience}
                      onChange={(value) => handleInputChange('experience', value)}
                      options={experienceOptions}
                      placeholder="Select Experience"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expected CTC (P.A)
                    </label>
                    <Input
                      type="text"
                      value={formData.expectedCTC}
                      onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                      placeholder="Enter expected CTC"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={`h-9 text-sm ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address 2
                    </label>
                    <Input
                      type="text"
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                      placeholder="Enter address"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Zip Code
                    </label>
                    <Input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter zip code"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="Enter mobile number"
                      className={`h-9 text-sm ${errors.mobile ? 'border-red-500' : ''}`}
                    />
                    {errors.mobile && (
                      <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Currency
                    </label>
                    <Input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      placeholder="Enter currency"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Skills
                    </label>
                    <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                      <label className="flex items-center gap-2 cursor-pointer mb-2 pb-2 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData.skills.length === skillsOptions.length}
                          onChange={handleSelectAll}
                          className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-xs font-semibold text-gray-700">Select All</span>
                      </label>
                      <div className="space-y-1.5">
                        {skillsOptions.map((skill) => (
                          <label
                            key={skill.value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.skills.includes(skill.value)}
                              onChange={() => handleSkillToggle(skill.value)}
                              className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-700">{skill.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Direct Interview?
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange('directInterview', !formData.directInterview)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.directInterview ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.directInterview ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rating: {formData.rating}/100
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Skype ID
                    </label>
                    <Input
                      type="text"
                      value={formData.skypeID}
                      onChange={(e) => handleInputChange('skypeID', e.target.value)}
                      placeholder="Enter Skype ID"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Source
                    </label>
                    <CustomSelect
                      value={formData.source}
                      onChange={(value) => handleInputChange('source', value)}
                      options={sourceOptions}
                      placeholder="Select Source"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notice Period
                    </label>
                    <CustomSelect
                      value={formData.noticePeriod}
                      onChange={(value) => handleInputChange('noticePeriod', value)}
                      options={noticePeriodOptions}
                      placeholder="Select notice period"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/candidates')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  Register Candidate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterCandidate;

