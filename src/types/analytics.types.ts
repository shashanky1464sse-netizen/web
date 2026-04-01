export interface AnalyticsSummary {
  avg_score: number;
  highest_score: number;
  lowest_score: number;
  latest_score: number;
  trend_percentage: number;
  total_sessions: number;
}

export interface LastFiveItem {
  id: string;
  score: number;
  created_at: string;
  role_applied_for: string | null;
}

export interface RecentActivityItem {
  type: 'interview' | 'resume';
  date: string | null;
  score: number | null;
  role_applied_for: string | null;
  interview_id: number | null;
}

export interface SkillsPracticedItem {
  category: string;
  session_count: number;
}

export interface CategoryPerformanceResponse {
  category_averages: Record<string, number>;
  weakest_category: string | null;
  strongest_category: string | null;
  trend: number | null;
}

export interface InterviewStreak {
  current_streak: number;
  week_activity: Array<{ day: string; completed: boolean }>;
}

export interface RoleSuggestion {
  role: string;
  match_score: number;
}

export interface CategoryPerformanceItem {
  category: string;
  avg_score: number;
}
