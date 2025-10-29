import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Download, 
  Edit, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Briefcase,
  Calendar,
  MoreVertical,
  Star,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import CustomSelect from '@/components/ui/custom-select';
import { UserRole } from '@/types';

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
  const getUserRole = (): UserRole => 'admin';

  const [candidates, setCandidates] = useState<Candidate[]>([
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
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const getStatusColor = (status: Candidate['status']) => {
    const colors: Record<Candidate['status'], string> = {
      'Active': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shortlisted': 'bg-green-100 text-green-700 border-green-200',
      'Interview': 'bg-purple-100 text-purple-700 border-purple-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
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
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    setCandidates(candidates.filter(c => c.id !== id));
    setShowDeleteModal(null);
  };

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Shortlisted', label: 'Shortlisted' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'On Hold', label: 'On Hold' },
  ];

  return (
    <MainLayout role={getUserRole()}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track all candidate profiles
              </p>
            </div>
            <Button
              onClick={() => navigate('/candidates/register')}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Register Candidate
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
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
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No candidates found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by registering a new candidate'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate('/candidates/register')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                          </div>
                          {candidate.rating && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                              <Star className="h-3 w-3 text-yellow-800 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{candidate.mobile}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/candidates/edit/${candidate.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowDeleteModal(candidate.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Candidate Info */}
                    <div className="space-y-2 mb-4">
                      {candidate.currentCompany && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{candidate.currentCompany}</span>
                        </div>
                      )}
                      {candidate.city && candidate.country && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{candidate.city}, {candidate.country}</span>
                        </div>
                      )}
                      {candidate.experience && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Briefcase className="h-3 w-3" />
                          <span>{candidate.experience}</span>
                        </div>
                      )}
                      {candidate.organization && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="truncate">{candidate.organization}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{candidate.appliedDate}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {candidate.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                        {candidate.matchScore && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getMatchColor(candidate.matchScore)}`}>
                              {candidate.matchScore}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/candidates/view/${candidate.id}`)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/candidates/edit/${candidate.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteModal} onOpenChange={(open) => !open && setShowDeleteModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Candidate</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this candidate? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CandidatesPage;
