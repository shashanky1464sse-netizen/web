import api from '@/lib/axios';
import {
  AnalyticsSummary,
  LastFiveItem,
  SkillsPracticedItem,
  InterviewStreak,
  RecentActivityItem,
  CategoryPerformanceResponse,
} from '@/types/analytics.types';

export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get<AnalyticsSummary>('/analytics/summary');
    return res.data;
  },

  getLastFive: async () => {
    const res = await api.get<LastFiveItem[]>('/analytics/last-five');
    return res.data;
  },

  getSkillsPracticed: async () => {
    const res = await api.get<SkillsPracticedItem[]>('/analytics/skills-practiced');
    return res.data;
  },

  getCategoryPerformance: async () => {
    const res = await api.get<CategoryPerformanceResponse>('/analytics/category-performance');
    return res.data;
  },

  getInterviewStreak: async () => {
    const res = await api.get<InterviewStreak>('/analytics/interview-streak');
    return res.data;
  },

  getRecentActivity: async () => {
    const res = await api.get<RecentActivityItem[]>('/analytics/recent-activity');
    return res.data;
  },
};
