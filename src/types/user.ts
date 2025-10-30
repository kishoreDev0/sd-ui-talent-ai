export type UserRole =
  | 'admin'
  | 'ta_executive'
  | 'ta_manager'
  | 'hiring_manager'
  | 'interviewer'
  | 'hr_ops';

export interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  active?: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number; // Add role_id field
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
  role: Role;
  avatar?: string;
}

// Helper to get full name
export const getUserFullName = (user: User): string => {
  return `${user.first_name} ${user.last_name}`.trim();
};

// Helper to get display name (first name only or full name)
export const getUserDisplayName = (user: User): string => {
  return user.first_name || user.email;
};

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
