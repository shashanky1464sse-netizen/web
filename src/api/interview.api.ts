import api from '@/lib/axios';
import { InterviewOut, InterviewAnswer } from '@/types/interview.types';

export const interviewApi = {
  createInterview: async (answers: InterviewAnswer[], role_applied_for?: string) => {
    const payload = { responses: answers, role_applied_for };
    const res = await api.post<InterviewOut>('/interviews/', payload);
    return res.data;
  },

  listInterviews: async () => {
    const res = await api.get<InterviewOut[]>('/interviews/');
    return res.data;
  },

  getInterview: async (id: string) => {
    const res = await api.get<InterviewOut>(`/interviews/${id}`);
    return res.data;
  },
};
