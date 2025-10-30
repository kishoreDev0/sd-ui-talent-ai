import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  X,
  CheckCircle,
  DollarSign,
  FileText,
  EllipsisVertical,
  Filter,
  Briefcase,
  Building2,
  User,
  DollarSign as DollarSignIcon,
  Upload,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomSelect from '@/components/ui/custom-select';

interface Job {
  id: number;
  company: string;
  companyIcon: string;
  title: string;
  paymentVerified: boolean;
  location: string;
  applicants: number;
  description: string;
  tags: string[];
  hourlyRate: string;
  proposals: number;
  priority: 'high' | 'medium' | 'low';
  creator: string;
}

const JobBoard: React.FC = () => {
  const navigate = useNavigate();
  const role = useUserRole();
  const [searchTerm, setSearchTerm] = useState('Product/UIUX designer');
  const [locationTerm, setLocationTerm] = useState('Country or timezone');
  const [sortBy, setSortBy] = useState('Newest');

  // New filter states
  const [jobTitle, setJobTitle] = useState('');
  const [majorSkills, setMajorSkills] = useState('');
  const [minCompensation, setMinCompensation] = useState('');
  const [maxCompensation, setMaxCompensation] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [priority, setPriority] = useState<{
    high: boolean;
    medium: boolean;
    low: boolean;
  }>({
    high: false,
    medium: false,
    low: false,
  });
  const [selectedCreator, setSelectedCreator] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const organizations = [
    { value: 'Plus AI', label: 'Plus AI' },
    { value: 'Apollo.io', label: 'Apollo.io' },
    { value: 'Tech Corp', label: 'Tech Corp' },
    { value: 'Design Studio', label: 'Design Studio' },
    { value: 'Startup Inc', label: 'Startup Inc' },
    { value: 'Global Solutions', label: 'Global Solutions' },
    { value: 'Creative Agency', label: 'Creative Agency' },
  ];

  const creators = [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Mike Johnson', label: 'Mike Johnson' },
    { value: 'Sarah Wilson', label: 'Sarah Wilson' },
    { value: 'David Brown', label: 'David Brown' },
  ];

  const handlePriorityChange = (priorityType: 'high' | 'medium' | 'low') => {
    setPriority((prev) => ({
      ...prev,
      [priorityType]: !prev[priorityType],
    }));
  };

  const handleClear = () => {
    setJobTitle('');
    setMajorSkills('');
    setMinCompensation('');
    setMaxCompensation('');
    setSelectedOrganization('');
    setPriority({ high: false, medium: false, low: false });
    setSelectedCreator('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadFiles(Array.from(files));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Fetch the template file
      const response = await fetch(
        '/src/../template/jobImportTemplate.55fa75b25009a9a5d85bc4e765a97479.xlsx',
      );
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jobImportTemplate.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please contact support.');
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = () => {
    // Handle file upload logic here
    console.log('Uploading files:', uploadFiles);
    // Close modal and reset
    setIsUploadModalOpen(false);
    setUploadFiles([]);
  };

  const renderFilterForm = () => (
    <div className="space-y-5">
      {/* Job Information Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4 text-gray-600" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Job Information
          </h4>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Job Title
          </label>
          <Input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full h-9 text-sm border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter job title"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Major Skills or Skills
          </label>
          <Input
            type="text"
            value={majorSkills}
            onChange={(e) => setMajorSkills(e.target.value)}
            className="w-full h-9 text-sm border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter skills"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Compensation Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSignIcon className="h-4 w-4 text-gray-600" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Compensation
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Min
            </label>
            <Input
              type="text"
              value={minCompensation}
              onChange={(e) => setMinCompensation(e.target.value)}
              className="w-full h-9 text-sm border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="$0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Max
            </label>
            <Input
              type="text"
              value={maxCompensation}
              onChange={(e) => setMaxCompensation(e.target.value)}
              className="w-full h-9 text-sm border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="$100k+"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Organization & Priority Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-gray-600" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Organization
          </h4>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Organization
          </label>
          <CustomSelect
            value={selectedOrganization}
            onChange={setSelectedOrganization}
            options={organizations}
            placeholder="Select organization"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Priority
          </label>
          <div className="space-y-2 bg-gray-50 rounded-md p-2">
            {[
              {
                key: 'high',
                label: 'High',
                color: 'bg-red-100 text-red-700 border-red-200',
              },
              {
                key: 'medium',
                label: 'Medium',
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
              },
              {
                key: 'low',
                label: 'Low',
                color: 'bg-green-100 text-green-700 border-green-200',
              },
            ].map((item) => (
              <label
                key={item.key}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-md border transition-colors ${
                  priority[item.key as keyof typeof priority]
                    ? item.color
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={priority[item.key as keyof typeof priority]}
                  onChange={() =>
                    handlePriorityChange(item.key as 'high' | 'medium' | 'low')
                  }
                  className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Creator Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-gray-600" />
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Creator
          </h4>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select Creator
          </label>
          <CustomSelect
            value={selectedCreator}
            onChange={setSelectedCreator}
            options={creators}
            placeholder="Select creator"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const jobs: Job[] = [
    {
      id: 1,
      company: 'Plus AI',
      companyIcon: '🔵',
      title: 'Experienced web designer needed for B2B business redesign',
      paymentVerified: true,
      location: 'Remote',
      applicants: 120,
      description:
        'We are looking for a skilled professional to join our team full-time. Your responsibilities will include building, editing, and managing our website, creating engaging PowerPoint presentations.',
      tags: [
        'Web Designer',
        'UI/UX Designer',
        'Framer Designer',
        'Webflow Designer',
      ],
      hourlyRate: '$25 - $50/hr',
      proposals: 25,
      priority: 'high',
      creator: 'John Doe',
    },
    {
      id: 2,
      company: 'Apollo.io',
      companyIcon: '🟡',
      title: 'Senior product designer / UI/UX designer',
      paymentVerified: true,
      location: 'Remote',
      applicants: 24,
      description:
        'We are seeking a talented and experienced Senior Product Designer / UI/UX Designer to join our team at Anyday Design This role involves working independently on the design of web applications.',
      tags: [
        'Product Designer',
        'UI/UX Designer',
        'Design System',
        'Figma',
        'Figjam',
      ],
      hourlyRate: '$30 - $60/hr',
      proposals: 18,
      priority: 'medium',
      creator: 'Jane Smith',
    },
    {
      id: 3,
      company: 'Tech Corp',
      companyIcon: '🟢',
      title: 'Frontend Developer with React Experience',
      paymentVerified: true,
      location: 'Hybrid',
      applicants: 45,
      description:
        'Looking for a frontend developer with strong React skills to join our growing team. You will work on building responsive web applications and collaborate with our design team.',
      tags: ['React', 'JavaScript', 'Frontend', 'CSS', 'HTML'],
      hourlyRate: '$20 - $40/hr',
      proposals: 12,
      priority: 'low',
      creator: 'Mike Johnson',
    },
    {
      id: 4,
      company: 'Design Studio',
      companyIcon: '🟣',
      title: 'Creative Graphic Designer',
      paymentVerified: false,
      location: 'On-site',
      applicants: 78,
      description:
        'We need a creative graphic designer to work on various marketing materials, social media graphics, and brand identity projects.',
      tags: [
        'Graphic Design',
        'Photoshop',
        'Illustrator',
        'Branding',
        'Marketing',
      ],
      hourlyRate: '$15 - $35/hr',
      proposals: 32,
      priority: 'medium',
      creator: 'Sarah Wilson',
    },
  ];

  // Filter jobs based on criteria
  const filteredJobs = jobs.filter((job) => {
    // Job Title filter
    if (jobTitle && !job.title.toLowerCase().includes(jobTitle.toLowerCase())) {
      return false;
    }

    // Major Skills filter
    if (majorSkills) {
      const skillsToSearch = majorSkills.toLowerCase();
      const jobSkills = job.tags.join(' ').toLowerCase();
      if (!jobSkills.includes(skillsToSearch)) {
        return false;
      }
    }

    // Compensation filter
    if (minCompensation || maxCompensation) {
      const hourlyRate = job.hourlyRate;
      const rateMatch = hourlyRate.match(/\$(\d+)\s*-\s*\$(\d+)/);
      if (rateMatch) {
        const minRate = parseInt(rateMatch[1]);
        const maxRate = parseInt(rateMatch[2]);

        if (minCompensation) {
          const minComp = parseInt(minCompensation);
          if (maxRate < minComp) return false;
        }

        if (maxCompensation) {
          const maxComp = parseInt(maxCompensation);
          if (minRate > maxComp) return false;
        }
      }
    }

    // Organization filter
    if (selectedOrganization && job.company !== selectedOrganization) {
      return false;
    }

    // Priority filter (using actual job priority)
    if (priority.high || priority.medium || priority.low) {
      if (priority.high && job.priority !== 'high') return false;
      if (priority.medium && job.priority !== 'medium') return false;
      if (priority.low && job.priority !== 'low') return false;
    }

    // Creator filter (using actual job creator)
    if (selectedCreator && job.creator !== selectedCreator) {
      return false;
    }

    return true;
  });

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Find all the job in the portal
              </h1>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                Browse latest job openings.
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-md p-4 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-8 h-9 text-sm w-full"
                    placeholder="Product/UIUX designer"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                    className="pl-8 h-9 text-sm w-full"
                    placeholder="Location (e.g., Mumbai, Delhi)"
                  />
                </div>
                <Button className="bg-black hover:bg-gray-800 text-white px-6 h-9 rounded-lg text-sm font-medium w-full sm:w-auto">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* Mobile Results Header */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-base font-semibold text-gray-900">
                Showing results ({filteredJobs.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Sort:</span>
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: 'Newest', label: 'Newest' },
                      { value: 'Oldest', label: 'Oldest' },
                      { value: 'Relevant', label: 'Most Relevant' },
                    ]}
                    className="min-w-[100px]"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[320px] p-0" align="end">
                    <div className="p-4 max-h-96 overflow-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900">
                          Filter & Actions
                        </h3>
                        <button
                          onClick={handleClear}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-4">
                        {/* Action Links */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate('/register-job')}
                            className="text-sm text-blue-600 hover-underline cursor-pointer"
                          >
                            Register Job
                          </button>
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="text-sm text-blue-600 hover-underline cursor-pointer"
                          >
                            Upload Job
                          </button>
                        </div>
                        {/* Filter Form */}
                        {renderFilterForm()}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Job Listings */}
            <div className="flex-1 order-1 lg:order-1">
              {/* Results Header - Desktop Only */}
              <div className="hidden lg:flex items-center justify-between mb-3">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  Showing results ({filteredJobs.length})
                </h2>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/register-job')}
                      className="text-xs sm:text-sm text-blue-600 hover-underline cursor-pointer"
                    >
                      Register Job
                    </button>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-xs sm:text-sm text-blue-600 hover-underline cursor-pointer"
                    >
                      Upload Job
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Sort:
                    </span>
                    <CustomSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'Newest', label: 'Newest' },
                        { value: 'Oldest', label: 'Oldest' },
                        { value: 'Relevant', label: 'Most Relevant' },
                      ]}
                      className="min-w-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Company Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                        {job.companyIcon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {job.company}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          {job.paymentVerified && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                              <span>Payment verified</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            {job.applicants} applicants
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job Title */}
                    <button
                      onClick={() =>
                        navigate(`/jobs/${job.id}`, { state: { job } })
                      }
                      className="text-left text-lg font-bold text-gray-900 mb-2 hover:underline"
                    >
                      {job.title}
                    </button>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{job.hourlyRate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{job.proposals} proposal</span>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(`/jobs/${job.id}`, { state: { job } })
                        }
                        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        See details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Filter Sidebar */}
            <div className="hidden lg:block w-full lg:w-80 order-2 lg:order-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>
                {renderFilterForm()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Job</DialogTitle>
            <DialogDescription>
              Upload job postings via CSV or Excel file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Download Template Button */}
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 text-sm h-9"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            {/* Upload Area */}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV, Excel formats</p>
              </div>
            </label>

            {/* Uploaded Files List */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                {uploadFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFiles([]);
                }}
                className="flex-1 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={uploadFiles.length === 0}
                className="flex-1 bg-black hover:bg-gray-800 text-white h-9"
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default JobBoard;
