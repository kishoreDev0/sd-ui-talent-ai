import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  UserPlus,
  Eye,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Star,
  User,
} from 'lucide-react';
import CustomSelect from '@/components/ui/custom-select';
import { useUserRole } from '@/utils/getUserRole';

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city?: string;
  state?: string;
  country?: string;
  currentCompany?: string;
  experience?: string;
  skills: string[];
  majorSkills: string[];
  matchScore?: number;
  status: 'Active' | 'Shortlisted' | 'Interview' | 'Rejected' | 'On Hold';
  appliedDate: string;
  rating?: number;
  organization?: string;
  currentCTC?: string;
  expectedCTC?: string;
}

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();

  const [candidates] = useState<Candidate[]>([
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      mobile: '+1 234-567-8900',
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      currentCompany: 'Tech Corp',
      experience: '5 Years',
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
      majorSkills: ['UI/UX Design'],
      matchScore: 92,
      status: 'Interview',
      appliedDate: 'Oct 18, 2024',
      rating: 85,
      organization: 'Tringapps Research Labs Pvt. Ltd.',
      currentCTC: '$120,000',
      expectedCTC: '$140,000',
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      mobile: '+1 234-567-8901',
      city: 'New York',
      state: 'New York',
      country: 'USA',
      currentCompany: 'Digital Solutions',
      experience: '3 Years',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
      majorSkills: ['Web Development'],
      matchScore: 88,
      status: 'Shortlisted',
      appliedDate: 'Oct 20, 2024',
      rating: 78,
      organization: 'Tringapps - BU2',
      currentCTC: '$95,000',
      expectedCTC: '$110,000',
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      mobile: '+1 234-567-8902',
      city: 'Seattle',
      state: 'Washington',
      country: 'USA',
      currentCompany: 'Design Studio',
      experience: '4 Years',
      skills: ['Design Systems', 'Sketch', 'Adobe XD', 'Wireframing'],
      majorSkills: ['UI/UX Design'],
      matchScore: 85,
      status: 'Active',
      appliedDate: 'Oct 22, 2024',
      rating: 82,
      organization: 'Tringapps Research Labs Pvt. Ltd.',
      currentCTC: '$105,000',
      expectedCTC: '$125,000',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusColor = (status: Candidate['status']) => {
    const colors: Record<Candidate['status'], string> = {
      Active: 'bg-blue-100 text-blue-700 border-blue-200',
      Shortlisted: 'bg-green-100 text-green-700 border-green-200',
      Interview: 'bg-primary-100 text-[#4F39F6] border-primary-200',
      Rejected: 'bg-red-100 text-red-700 border-red-200',
      'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 80) return 'bg-blue-100 text-blue-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === 'All' || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Shortlisted', label: 'Shortlisted' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'On Hold', label: 'On Hold' },
  ];

  const role = useUserRole();

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Candidates
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage and track all candidate profiles
              </p>
            </div>
            <Button
              onClick={() => navigate('/candidates/register')}
              className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Register Candidate
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600"
                />
              </div>
              <div className="w-full md:w-48">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  placeholder="Filter by status"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <AnimatePresence mode="wait">
            {filteredCandidates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center"
              >
                <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No candidates found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by registering a new candidate'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate('/candidates/register')}
                    className="bg-[#4F39F6] hover:bg-[#3D2DC4] text-white"
                  >
                    Register Candidate
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Card Header - Minimal Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-[#4F39F6] rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {candidate.firstName.charAt(0)}
                            {candidate.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(candidate)}
                        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex-shrink-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                            <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)} dark:bg-opacity-20`}
                        >
                          {candidate.status}
                        </span>
                        {candidate.matchScore && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${getMatchColor(candidate.matchScore)}`}
                            >
                              {candidate.matchScore}%
                            </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Candidate Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <div className="space-y-6 mt-4">
                {/* Header Section */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-[#4F39F6] rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {selectedCandidate.firstName.charAt(0)}
                    {selectedCandidate.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedCandidate.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCandidate.status)}`}
                      >
                        {selectedCandidate.status}
                      </span>
                      {selectedCandidate.matchScore && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getMatchColor(selectedCandidate.matchScore)}`}
                        >
                          Match: {selectedCandidate.matchScore}%
                        </span>
                      )}
                      {selectedCandidate.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedCandidate.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedCandidate.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mobile
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedCandidate.mobile}
                        </p>
                      </div>
                    </div>
                    {selectedCandidate.city && selectedCandidate.country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Location
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedCandidate.city}
                            {selectedCandidate.state &&
                              `, ${selectedCandidate.state}`}
                            , {selectedCandidate.country}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.experience && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Experience
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedCandidate.experience}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCandidate.currentCompany && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Current Company
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedCandidate.currentCompany}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.organization && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Organization
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedCandidate.organization}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCandidate.currentCTC && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Current CTC
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedCandidate.currentCTC}
                        </p>
                      </div>
                    )}
                    {selectedCandidate.expectedCTC && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Expected CTC
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedCandidate.expectedCTC}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-[#4F39F6] dark:text-primary-300 rounded-md text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Major Skills */}
                {selectedCandidate.majorSkills &&
                  selectedCandidate.majorSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Major Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.majorSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Additional Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Applied Date
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedCandidate.appliedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CandidatesPage;
