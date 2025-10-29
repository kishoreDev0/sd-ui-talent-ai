export type UserRole =
  | 'admin'
  | 'hiring_manager'
  | 'interviewer'
  | 'ta_team'
  | 'hr_ops';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Open' | 'Paused' | 'Closed';
  postedDate: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  hiringManagerId: string;
  candidateCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  skills: string[];
  experience: string;
  currentCompany?: string;
  appliedDate: string;
  status:
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Offer'
    | 'Hired'
    | 'Rejected';
  matchScore?: number;
  matchedSkills?: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  scheduledDate: string;
  duration: number; // in minutes
  type: 'Technical' | 'Behavioral' | 'Final' | 'Phone Screen';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  meetLink?: string;
  feedbackId?: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  candidateId: string;
  rating: number; // 1-5
  comments: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendation: 'Hire' | 'Strong Hire' | 'Maybe' | 'No Hire';
  submittedDate: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeCandidates: number;
  upcomingInterviews: number;
  hiresThisMonth: number;
}
