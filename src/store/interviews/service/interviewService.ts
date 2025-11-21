import axiosInstance from '@/axios-setup/axios-instance';
import { INTERVIEWS } from '@/store/endpoints';
import type {
  InterviewFeedback,
  InterviewFeedbackListResponse,
  InterviewFeedbackPayload,
  InterviewFeedbackResponse,
  InterviewRecording,
  InterviewRecordingListResponse,
  InterviewRecordingPayload,
  InterviewRecordingResponse,
  InterviewRound,
  InterviewRoundCreatePayload,
  InterviewRoundItemResponse,
  InterviewRoundListPayload,
  InterviewRoundListQuery,
  InterviewRoundListResponse,
  PanelAssignmentInput,
} from '../types/interviewTypes';

const emptyList: InterviewRoundListPayload = {
  result: [],
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 0,
};

const unwrapRound = (response: InterviewRoundItemResponse): InterviewRound => {
  const round = response?.data;
  if (!round) {
    throw new Error('Invalid interview round response payload');
  }
  return round;
};

export const listInterviewRounds = async (
  params: InterviewRoundListQuery = {},
): Promise<InterviewRoundListPayload> => {
  const queryParams: Record<string, unknown> = {
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
  };

  if (params.candidateId) queryParams.candidate_id = params.candidateId;
  if (params.jobId) queryParams.job_id = params.jobId;
  if (params.status) queryParams.status = params.status;

  const response = await axiosInstance.get<InterviewRoundListResponse>(
    INTERVIEWS.LIST,
    { params: queryParams },
  );

  return response.data?.data ?? emptyList;
};

export const createInterviewRound = async (
  payload: InterviewRoundCreatePayload,
): Promise<InterviewRound> => {
  const response = await axiosInstance.post<InterviewRoundItemResponse>(
    INTERVIEWS.CREATE,
    payload,
  );
  return unwrapRound(response.data);
};

export const updatePanelAssignments = async (
  roundId: number,
  panel: PanelAssignmentInput[],
): Promise<InterviewRound> => {
  const response = await axiosInstance.post<InterviewRoundItemResponse>(
    INTERVIEWS.UPDATE_PANEL(roundId),
    { panel },
  );
  return unwrapRound(response.data);
};

export const updateRoundStatus = async (
  roundId: number,
  status: string,
): Promise<InterviewRound> => {
  const response = await axiosInstance.patch<InterviewRoundItemResponse>(
    INTERVIEWS.UPDATE_STATUS(roundId),
    { status },
  );
  return unwrapRound(response.data);
};

export const registerRecording = async (
  roundId: number,
  payload: InterviewRecordingPayload,
): Promise<InterviewRecording> => {
  const response = await axiosInstance.post<InterviewRecordingResponse>(
    INTERVIEWS.RECORDINGS(roundId),
    payload,
  );
  const recording = response.data?.data;
  if (!recording) {
    throw new Error('Invalid recording response payload');
  }
  return recording;
};

export const listRecordings = async (
  roundId: number,
): Promise<InterviewRecording[]> => {
  const response = await axiosInstance.get<InterviewRecordingListResponse>(
    INTERVIEWS.RECORDINGS(roundId),
  );
  return response.data?.data ?? [];
};

export const submitFeedback = async (
  roundId: number,
  payload: InterviewFeedbackPayload,
): Promise<InterviewFeedback> => {
  const response = await axiosInstance.post<InterviewFeedbackResponse>(
    INTERVIEWS.FEEDBACK(roundId),
    payload,
  );
  const feedback = response.data?.data;
  if (!feedback) {
    throw new Error('Invalid feedback response payload');
  }
  return feedback;
};

export const listFeedback = async (
  roundId: number,
): Promise<InterviewFeedback[]> => {
  const response = await axiosInstance.get<InterviewFeedbackListResponse>(
    INTERVIEWS.FEEDBACK(roundId),
  );
  return response.data?.data ?? [];
};
