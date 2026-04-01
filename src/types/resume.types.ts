export interface ResumeSkills {
  programming_languages?: string[];
  frameworks?: string[];
  tools?: string[];
  databases?: string[];
  [key: string]: string[] | undefined;
}

export interface ResumeAnalysisOut {
  target_role: string;
  experience_level: string;
  skills: ResumeSkills;
}

export interface Question {
  question: string;
  category: string;
}

export interface GenerateQuestionsResponse {
  generated_questions: Question[];
}
