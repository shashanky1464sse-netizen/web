export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  skills_json?: any
  experience_level?: string
  experience_years?: number
  target_role?: string
  title?: string | null
  location?: string | null
  bio?: string | null
  profile_photo_url?: string | null
  preferred_difficulty?: string | null
}

export interface LoginStreak {
  currentStreak: number
  days: {
    day: string
    completed: boolean
  }[]
}

export interface ResumeData {
  id: string
  fileName: string
  uploadDate: string
  skillsExtracted: string[]
  categorizedSkills?: Record<string, string[]>
  isActive: boolean
  targetRole?: string
  experienceYears?: number
  experienceLevel?: string
}

export interface InterviewSession {
  id: string
  date: string
  questionsCount: number
  completedQuestions: number
  score: number | null
  skills: string[]
}

export interface InterviewQuestion {
  id: string
  questionNumber: number
  totalQuestions: number
  text: string
  skill: string
}

export interface InterviewAnswer {
  questionId: string
  answer: string
  score: number
  feedback: string
  suggestions: string[]
}

export interface InterviewResult {
  sessionId: string
  date: string
  totalScore: number
  maxScore: number
  questions: InterviewAnswer[]
  overallFeedback: string
  improvementAreas: string[]
}

export interface Report {
  id: string
  date: string
  skill: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'needs_improvement'
  isPrimary: boolean
  appliedRole?: string
}

export interface FocusArea {
  skill: string
  type: 'primary' | 'secondary'
}

export interface DashboardData {
  greeting: string
  streak: LoginStreak
  resume: ResumeData | null
  interviewProgress: {
    sessionsCompleted: number
    latestScore: number | null
    averageScore: number
    trendPercentage: number
    lastSessionDate: string | null
    lastFive: {
      id: string
      date: string
      score: number
    }[]
    topSkills: {
      category: string
      sessionCount: number
    }[]
  }
  focusAreas: FocusArea[]
  user: User
}
