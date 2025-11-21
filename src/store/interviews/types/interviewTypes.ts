export type InterviewRoundStatus =
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'needs_feedback'
  | 'cancelled';

export interface PanelAssignment {
  id: number;
  interviewer_id: number | null;
  role?: string | null;
  status: string;
  reminder_sent: boolean;
  join_url?: string | null;
}

export interface PanelAssignmentInput {
  interviewer_id: number;
  role?: string;
  status?: string;
}

export interface InterviewRound {
  id: number;
  candidate_id: number | null;
  job_id: number | null;
  round_name: string;
  stage?: string | null;
  scheduled_start: string;
  duration_minutes: number;
  timezone?: string | null;
  meeting_url?: string | null;
  meeting_code?: string | null;
  location?: string | null;
  notes?: string | null;
  status: InterviewRoundStatus | string;
  recording_enabled: boolean;
  organizer_email?: string | null;
  created_at: string;
  updated_at: string;
  panel_assignments: PanelAssignment[];
}

export interface InterviewRoundListPayload {
  result: InterviewRound[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InterviewRoundListResponse {
  success: boolean;
  status_code: number;
  data: InterviewRoundListPayload;
}

export interface InterviewRoundItemResponse {
  success: boolean;
  status_code: number;
  data: InterviewRound;
}

export interface InterviewRoundCreatePayload {
  candidate_id?: number;
  job_id?: number;
  round_name: string;
  stage?: string;
  scheduled_start: string;
  duration_minutes: number;
  timezone?: string;
  meeting_url?: string;
  meeting_code?: string;
  location?: string;
  notes?: string;
  recording_enabled?: boolean;
  organizer_email?: string;
  panel?: PanelAssignmentInput[];
}

export interface InterviewRoundListQuery {
  page?: number;
  pageSize?: number;
  candidateId?: number;
  jobId?: number;
  status?: string;
}

export interface InterviewRecording {
  id: number;
  interview_round_id: number;
  s3_bucket: string;
  s3_key: string;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  recorded_at?: string | null;
  transcription_status?: string | null;
  transcript_text?: string | null;
  compliance_flags?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewRecordingResponse {
  success: boolean;
  status_code: number;
  data: InterviewRecording;
}

export interface InterviewRecordingListResponse {
  success: boolean;
  status_code: number;
  data: InterviewRecording[];
}

export interface InterviewRecordingPayload {
  s3_bucket: string;
  s3_key: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  recorded_at?: string;
  transcription_status?: string;
  transcript_text?: string;
  compliance_flags?: string;
}

export interface InterviewFeedback {
  id: number;
  interview_round_id: number;
  interviewer_id?: number | null;
  overall_rating?: number | null;
  technical_rating?: number | null;
  communication_rating?: number | null;
  culture_fit_rating?: number | null;
  comments?: string | null;
  submitted_at: string;
}

export interface InterviewFeedbackResponse {
  success: boolean;
  status_code: number;
  data: InterviewFeedback;
}

export interface InterviewFeedbackListResponse {
  success: boolean;
  status_code: number;
  data: InterviewFeedback[];
}

export interface InterviewFeedbackPayload {
  overall_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  culture_fit_rating?: number;
  comments?: string;
}
