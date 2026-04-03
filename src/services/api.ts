import axios from 'axios'
import {
  User,
  DashboardData,
  ResumeData,
  InterviewSession,
  InterviewQuestion,
  InterviewResult,
  Report,
  LoginStreak,
} from '../types'

const API_BASE_URL = 'http://180.235.121.253:8160'

// Simple axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Mock/Local Storage memory for current interview session
const IN_MEMORY_INTERVIEW_KEY = 'current_interview_session'

export const authService = {
  async login(
    email: string,
    password?: string
  ): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/login', { email, password })
    const token = res.data.access_token

    // temporarily set token for next request
    localStorage.setItem('auth_token', token)

    // fetch profile
    const profileRes = await apiClient.get('/profile/me')
    const user: User = {
      id: profileRes.data.user_id?.toString() || '1',
      name: profileRes.data.name || email.split('@')[0],
      email: profileRes.data.email || email,
      createdAt: new Date().toISOString(),
      skills_json: profileRes.data.skills_json,
      experience_level: profileRes.data.experience_level,
      experience_years: profileRes.data.experience_years,
      target_role: profileRes.data.target_role,
      title: profileRes.data.title,
      location: profileRes.data.location,
      bio: profileRes.data.bio,
      profile_photo_url: profileRes.data.profile_photo_url,
      preferred_difficulty: profileRes.data.preferred_difficulty,
    }
    return { token, user }
  },
  async register(
    name: string,
    email: string,
    password?: string
  ): Promise<{ token: string; user: User }> {
    await apiClient.post('/auth/register', { name, email, password })
    return this.login(email, password)
  },
  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem(IN_MEMORY_INTERVIEW_KEY)
  },
}

export const profileService = {
  async getProfile(): Promise<User> {
    const profileRes = await apiClient.get('/profile/me')
    return {
      id: profileRes.data.user_id?.toString() || '1',
      name: profileRes.data.name || 'User',
      email: profileRes.data.email || 'user@example.com',
      createdAt: new Date().toISOString(),
      skills_json: profileRes.data.skills_json,
      experience_level: profileRes.data.experience_level,
      experience_years: profileRes.data.experience_years,
      target_role: profileRes.data.target_role,
      title: profileRes.data.title,
      location: profileRes.data.location,
      bio: profileRes.data.bio,
      profile_photo_url: profileRes.data.profile_photo_url,
      preferred_difficulty: profileRes.data.preferred_difficulty,
    }
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await apiClient.put('/profile/me', {
      ...data
    })
    return {
      id: res.data.user_id?.toString() || '1',
      name: res.data.name || 'User',
      email: res.data.email || 'user@example.com',
      createdAt: new Date().toISOString(),
      skills_json: res.data.skills_json,
      experience_level: res.data.experience_level,
      experience_years: res.data.experience_years,
      target_role: res.data.target_role,
      title: res.data.title,
      location: res.data.location,
      bio: res.data.bio,
      profile_photo_url: res.data.profile_photo_url,
      preferred_difficulty: res.data.preferred_difficulty,
    }
  },
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    // Parallel fetch
    const [summaryRes, streakRes, focusRes, profileRes, lastFiveRes, skillsRes] = await Promise.all([
      apiClient.get('/analytics/summary').catch(() => ({ data: {} })),
      apiClient.get('/analytics/interview-streak').catch(() => ({ data: {} })),
      apiClient.get('/analytics/category-performance').catch(() => ({ data: [] })),
      apiClient.get('/profile/me').catch(() => ({ data: {} })),
      apiClient.get('/analytics/last-five').catch(() => ({ data: [] })),
      apiClient.get('/analytics/skills-practiced').catch(() => ({ data: [] })),
    ])

    const userEmail = profileRes.data.email || 'User'
    const name = profileRes.data.name || userEmail.split('@')[0]

    const streak: LoginStreak = {
      currentStreak: streakRes.data.current_streak || 0,
      days: (streakRes.data.week_activity || []).map((day: any) => {
        let dayStr = '?'
        if (day.date) {
           const d = new Date(day.date)
           if (!isNaN(d.getTime())) {
             dayStr = d.toLocaleDateString('en-US', { weekday: 'narrow' })
           }
        }
        return {
          day: dayStr,
          completed: !!day.has_activity,
        }
      }),
    }

    if (!streak.days || streak.days.length === 0) {
      streak.days = [
        { day: 'M', completed: false },
        { day: 'T', completed: false },
        { day: 'W', completed: false },
        { day: 'T', completed: false },
        { day: 'F', completed: false },
        { day: 'S', completed: false },
        { day: 'S', completed: false },
      ]
    }

    // Attempt to map focus areas
    const focusAreas = Array.isArray(focusRes.data)
      ? focusRes.data.map((fa: any, idx: number) => ({
          skill: fa.skill_name || fa.category || 'Skill',
          type: (idx === 0 ? 'primary' : 'secondary') as 'primary' | 'secondary',
        }))
      : []

    return {
      greeting: `Welcome back, ${name} 👋`,
      user: {
        id: profileRes.data.user_id?.toString(),
        name,
        email: userEmail,
        createdAt: new Date().toISOString()
      },
      streak,
      resume: profileRes.data.skills_json ? {
        id: 'res_1',
        fileName: 'resume.pdf (uploaded)',
        uploadDate: new Date().toLocaleDateString(),
        skillsExtracted: (profileRes.data.skills_json && typeof profileRes.data.skills_json === 'object') 
          ? Object.values(profileRes.data.skills_json).flat() as string[]
          : [],
        isActive: true,
      } : null,
      interviewProgress: {
        sessionsCompleted: summaryRes.data.total_sessions || 0,
        latestScore: summaryRes.data.latest_score || null,
        averageScore: summaryRes.data.average_score || 0,
        trendPercentage: summaryRes.data.trend_percentage || 0,
        lastSessionDate: summaryRes.data.total_sessions > 0 ? new Date().toLocaleDateString() : null, // Not directly returned
        lastFive: Array.isArray(lastFiveRes.data) ? lastFiveRes.data.map((i: any) => ({
          id: i.id.toString(),
          date: i.created_at,
          score: i.score
        })) : [],
        topSkills: Array.isArray(skillsRes.data) ? skillsRes.data.slice(0, 5).map((s: any) => ({
          category: s.category,
          sessionCount: s.session_count
        })) : []
      },
      focusAreas,
    }
  },
}

export const resumeService = {
  async uploadResume(file: File): Promise<ResumeData> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const t_skills = res.data.technical_skills || {}
    const tools = res.data.tools_frameworks || []
    const soft = res.data.soft_skills || []

    const categorized: Record<string, string[]> = { ...t_skills }
    if (tools.length > 0) categorized['tools_frameworks'] = tools
    if (soft.length > 0) categorized['soft_skills'] = soft

    const flattenedSkills: string[] = []
    Object.values(categorized).forEach((arr: any) => {
      if (Array.isArray(arr)) flattenedSkills.push(...arr)
    })

    return {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      uploadDate: new Date().toLocaleDateString(),
      skillsExtracted: flattenedSkills,
      categorizedSkills: categorized,
      isActive: true,
      targetRole: res.data.inferred_target_role,
      experienceYears: res.data.detected_experience_years,
      experienceLevel: res.data.experience_level,
    }
  },
  async getResumeStatus(): Promise<ResumeData | null> {
    const profileRes = await apiClient.get('/profile/me')
    if (profileRes.data.skills_json) {
       let ext = [];
       if (typeof profileRes.data.skills_json === 'object') {
          for (let key in profileRes.data.skills_json) {
            if (Array.isArray(profileRes.data.skills_json[key])) ext.push(...profileRes.data.skills_json[key])
          }
       }
       return {
          id: '1',
          fileName: 'Uploaded Resume',
          uploadDate: new Date().toLocaleDateString(),
          skillsExtracted: ext,
          categorizedSkills: typeof profileRes.data.skills_json === 'object' ? profileRes.data.skills_json : undefined,
          isActive: true,
          targetRole: profileRes.data.target_role,
          experienceYears: profileRes.data.experience_years,
          experienceLevel: profileRes.data.experience_level,
       }
    }
    return null
  },
  async deleteResume(): Promise<void> {
    // Backend doesn't have an explicit delete, we'd clear profile skills here but no route exists yet
  },
}

export const interviewService = {
  async startInterview(): Promise<InterviewSession> {
    // Fetch profile to get skills
    const profileRes = await apiClient.get('/profile/me')
    let skillsSet: string[] = ['General']
    let softSkills: string[] = []
    let toolsFrameworks: string[] = []
    let targetRole = profileRes.data.target_role || 'Software Engineer'

    if (profileRes.data.skills_json) {
       const s = profileRes.data.skills_json
       if (typeof s === 'object') {
         softSkills = s['soft_skills'] || []
         toolsFrameworks = s['tools_frameworks'] || []
         
         const extractedTech: string[] = []
         Object.keys(s).forEach(key => {
           if (key !== 'soft_skills' && key !== 'tools_frameworks' && Array.isArray(s[key])) {
             extractedTech.push(...s[key])
           }
         })
         if (extractedTech.length > 0) skillsSet = extractedTech
       }
    }

    // Generate questions
    const genRes = await apiClient.post('/resume/generate-questions', {
      skills: skillsSet.slice(0, 15), // prevent overflowing
      soft_skills: softSkills,
      tools_frameworks: toolsFrameworks,
      target_role: targetRole,
      experience_years: profileRes.data.experience_years || 2,
    })

    const generated = genRes.data.generated_questions || []
    
    // Fallback if AI fails
    const defaultQs = [
      { skill: 'Communication', question: 'Tell me about a time you resolved a conflict.' },
      { skill: 'Problem Solving', question: 'Describe a difficult technical problem you faced.' }
    ]
    const questions = generated.length > 0 ? generated : defaultQs

    const sessionId = 'sess_' + Math.random().toString()
    
    const store = {
      sessionId,
      questions: questions.map((q: any) => ({
        skill: q.skill || q.category || 'General',
        text: q.question,
        answer: null
      }))
    }
    localStorage.setItem(IN_MEMORY_INTERVIEW_KEY, JSON.stringify(store))

    return {
      id: sessionId,
      date: new Date().toISOString(),
      questionsCount: store.questions.length,
      completedQuestions: 0,
      score: null,
      skills: store.questions.map((q: any) => q.skill),
    }
  },
  async getQuestion(
    sessionId: string,
    questionNumber: number
  ): Promise<InterviewQuestion> {
    const raw = localStorage.getItem(IN_MEMORY_INTERVIEW_KEY)
    if (!raw) throw new Error('No interview in progress')
    const store = JSON.parse(raw)
    const qData = store.questions[questionNumber - 1]
    
    return {
      id: 'q_' + questionNumber,
      questionNumber,
      totalQuestions: store.questions.length,
      text: qData.text,
      skill: qData.skill,
    }
  },
  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{ success: boolean }> {
    const raw = localStorage.getItem(IN_MEMORY_INTERVIEW_KEY)
    if (!raw) throw new Error('No interview in progress')
    const store = JSON.parse(raw)
    const idx = parseInt(questionId.replace('q_', '')) - 1
    if (store.questions[idx]) {
      store.questions[idx].answer = answer
    }
    localStorage.setItem(IN_MEMORY_INTERVIEW_KEY, JSON.stringify(store))
    return { success: true }
  },
  async getResults(sessionId: string): Promise<InterviewResult> {
    const raw = localStorage.getItem(IN_MEMORY_INTERVIEW_KEY)
    if (!raw) throw new Error('No interview in progress')
    const store = JSON.parse(raw)
    
    // Now we combine all Q/As and call real POST /interview/
    const payload = store.questions.map((q: any) => ({
      question: q.text,
      answer: q.answer || '',
      category: q.skill
    }))

    const finalRes = await apiClient.post('/interviews/', payload)
    
    // Extract results from finalRes (InterviewSchema)
    localStorage.removeItem(IN_MEMORY_INTERVIEW_KEY)
    
    const interviewData = finalRes.data
    return {
      sessionId: interviewData.id.toString(),
      date: new Date(interviewData.created_at).toISOString(),
      totalScore: interviewData.score,
      maxScore: 100,
      questions: [], // The backend doesn't return per-question feedback in InterviewSchema directly, we can mock or parse it.
      overallFeedback: interviewData.feedback_summary || 'Good start. Remember to focus on details.',
      improvementAreas: [],
    }
  },
}

export const reportService = {
  async getReports(search?: string): Promise<Report[]> {
    const res = await apiClient.get('/interviews/')
    let interviews = res.data || []
    
    if (search) {
      interviews = interviews.filter((i: any) => {
        const skillsStr = (i.skills || []).map((s:any) => s.skill_name).join(' ').toLowerCase()
        return skillsStr.includes(search.toLowerCase())
      })
    }

    return interviews.map((i: any) => {
      // Get primary skill (highest questions answered or just the first)
      const primarySkill = i.skills && i.skills.length > 0 ? i.skills[0].skill_name : 'General'
      return {
        id: i.id.toString(),
        date: new Date(i.created_at).toLocaleDateString(),
        skill: primarySkill,
        score: i.score,
        maxScore: 100,
        status: i.score >= 75 ? 'excellent' : (i.score >= 50 ? 'good' : 'needs_improvement'),
        isPrimary: true,
        appliedRole: i.target_role || 'Software Engineer'
      }
    })
  },
  async getReportDetail(id: string): Promise<Report | undefined> {
    const reports = await this.getReports()
    return reports.find(r => r.id === id)
  },
}
