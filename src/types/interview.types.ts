export interface InterviewQuestion {
  question: string;
  category: string;
  type?: 'main' | 'follow_up';
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  category: string;
  score?: number;
  suggestions?: string;
  strengths?: string;
  improvements?: string;
}

export interface InterviewSkill {
  id: number;
  skill_name: string;
  category_score: number;
}

export interface InterviewOut {
  id: number;
  score: number;
  created_at: string;
  feedback_level: string;
  summary: string;
  role_applied_for: string;
  question_answers?: InterviewAnswer[];  // only present on detail endpoint, not list
  skills: InterviewSkill[];
}
