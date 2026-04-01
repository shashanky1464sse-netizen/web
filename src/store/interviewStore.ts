import { create } from 'zustand';
import { InterviewQuestion, InterviewAnswer } from '@/types/interview.types';

interface InterviewState {
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentIndex: number;
  setQuestions: (questions: InterviewQuestion[]) => void;
  replaceQuestion: (index: number, newQuestion: InterviewQuestion) => void;
  submitAnswer: (answer: string) => void;
  reset: () => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  questions: [],
  answers: [],
  currentIndex: 0,
  targetRole: '',
  
  setTargetRole: (targetRole) => set({ targetRole }),
  
  setQuestions: (questions) => {
    set({ questions, answers: [], currentIndex: 0 });
  },

  replaceQuestion: (index, newQuestion) => {
    set((state) => {
      const updated = [...state.questions];
      if (index >= 0 && index < updated.length) {
        updated[index] = newQuestion;
      }
      return { questions: updated };
    });
  },
  
  submitAnswer: (answerText) => {
    set((state) => {
      // Create the answer record from current question
      if (state.currentIndex >= state.questions.length) return state;
      
      const currentQ = state.questions[state.currentIndex];
      const newAnswer: InterviewAnswer = {
        question: currentQ.question,
        category: currentQ.category,
        answer: answerText,
      };
      
      return {
        answers: [...state.answers, newAnswer],
        currentIndex: state.currentIndex + 1,
      };
    });
  },
  
  reset: () => {
    set({ questions: [], answers: [], currentIndex: 0, targetRole: '' });
  },
}));
