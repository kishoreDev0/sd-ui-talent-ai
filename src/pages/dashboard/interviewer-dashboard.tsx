import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
 

interface Candidate {
  id: number;
  name: string;
  position: string;
  experience: string;
  skills: string[];
  avatar: string;
  status: 'applied' | 'screening' | 'interview_scheduled' | 'feedback_pending' | 'selected' | 'rejected';
  interviewDate?: string;
  interviewTime?: string;
  matchScore?: number;
  email: string;
  phone: string;
}

// Simplified dashboard: no internal sidebar or kanban

const InterviewerDashboard: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [candidates] = useState<Candidate[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Product Designer',
      experience: '5 years',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems'],
      avatar: 'SJ',
      status: 'applied',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      matchScore: 92,
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Frontend Developer',
      experience: '3 years',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      avatar: 'MC',
      status: 'screening',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Emily Davis',
      position: 'UI/UX Designer',
      experience: '4 years',
      skills: ['Sketch', 'Figma', 'Adobe XD', 'User Research'],
      avatar: 'ED',
      status: 'interview_scheduled',
      interviewDate: '2024-01-28',
      interviewTime: '10:00 AM',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 345-6789',
      matchScore: 85,
    },
    {
      id: 4,
      name: 'David Park',
      position: 'Backend Engineer',
      experience: '6 years',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      avatar: 'DP',
      status: 'interview_scheduled',
      interviewDate: '2024-01-29',
      interviewTime: '2:00 PM',
      email: 'david.park@email.com',
      phone: '+1 (555) 456-7890',
      matchScore: 90,
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      position: 'Full Stack Developer',
      experience: '4 years',
      skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
      avatar: 'JM',
      status: 'feedback_pending',
      interviewDate: '2024-01-25',
      interviewTime: '11:00 AM',
      email: 'jessica.martinez@email.com',
      phone: '+1 (555) 567-8901',
      matchScore: 87,
    },
    {
      id: 6,
      name: 'Robert Wilson',
      position: 'DevOps Engineer',
      experience: '5 years',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      avatar: 'RW',
      status: 'selected',
      email: 'robert.wilson@email.com',
      phone: '+1 (555) 678-9012',
      matchScore: 95,
    },
    {
      id: 7,
      name: 'Lisa Anderson',
      position: 'Product Manager',
      experience: '7 years',
      skills: ['Agile', 'Product Strategy', 'Analytics', 'User Research'],
      avatar: 'LA',
      status: 'rejected',
      email: 'lisa.anderson@email.com',
      phone: '+1 (555) 789-0123',
      matchScore: 75,
    },
  ]);

  const scheduledInterviews = useMemo(
    () => candidates.filter((c) => c.status === 'interview_scheduled'),
    [candidates],
  );
  const interviewsCount = scheduledInterviews.length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-6"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Interviews</h1>
              <p className="text-sm text-gray-600 mb-4">Assigned to you</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                <Calendar className="w-5 h-5" />
                <span className="text-xl font-semibold">{interviewsCount}</span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Interviews</h2>
              {scheduledInterviews.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No scheduled interviews</div>
              ) : (
                <div className="space-y-3">
                  {scheduledInterviews.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => { setSelectedCandidate(candidate); setIsDetailModalOpen(true); }}
                      className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {candidate.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-xs text-gray-600">{candidate.position}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>
                            {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                            {candidate.interviewTime ? ` at ${candidate.interviewTime}` : ''}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Candidate Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedCandidate.avatar}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">
                      {selectedCandidate.name}
                    </DialogTitle>
                    <p className="text-gray-600 mt-1">{selectedCandidate.position}</p>
                  </div>
                  {/* Status badge removed in simplified view */}
                </div>
              </DialogHeader>

              <DialogDescription>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <p className="text-gray-600">{selectedCandidate.experience}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{selectedCandidate.phone}</span>
                        </div>
                      </div>
                    </div>

                    {selectedCandidate.interviewDate && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Interview</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(selectedCandidate.interviewDate).toLocaleDateString(
                                'en-US',
                                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{selectedCandidate.interviewTime}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCandidate.matchScore && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Match Score</h3>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                          style={{ width: `${selectedCandidate.matchScore}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedCandidate.matchScore}% match with job requirements
                      </p>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Feedback and add candidate modals removed for simplified view */}
    </div>
  );
};

export default InterviewerDashboard;
