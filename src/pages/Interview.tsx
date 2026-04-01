import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '@/store/interviewStore';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { SpeechInput } from '@/components/interview/SpeechInput';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { interviewApi } from '@/api/interview.api';
import { resumeApi } from '@/api/resume.api';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { questions, currentIndex, answers, submitAnswer, targetRole, replaceQuestion } = useInterviewStore();
  const { user } = useAuthStore();
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Guard against double-submission (e.g. React StrictMode double effects)
  const isSubmittingRef = useRef(false);
  
  // Protect route if no questions loaded
  useEffect(() => {
    if (!questions || questions.length === 0) {
      toast.error("No active interview context found.");
      navigate('/upload-resume');
    }
  }, [questions, navigate]);

  const handleAnswerSubmit = async (answerText: string) => {
    // Guard against double calls
    if (isSubmittingRef.current) return;

    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      // Don't call submitAnswer (which increments index past array bounds)
      // Build all answers including this final one and finalize
      isSubmittingRef.current = true;
      const allAnswers = [
        ...answers,
        {
          question: questions[currentIndex].question,
          category: questions[currentIndex].category,
          answer: answerText,
        },
      ];
      await finalizeInterview(allAnswers);
    } else {
      submitAnswer(answerText);
    }
  };

  const finalizeInterview = async (finalAnswers: any[]) => {
    try {
      setIsEvaluating(true);
      toast("Evaluating your responses...", { icon: "🧠", duration: 3000 });
      
      const res = await interviewApi.createInterview(finalAnswers, targetRole);
      
      // Store result ID to show in Success screen
      sessionStorage.setItem('r2i_last_interview_id', String(res.id));

      // ── Invalidate all analytics caches so Home.tsx shows updated streak ──
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      navigate('/interview-success');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to finalize interview evaluation. High load on AI endpoints.");
      isSubmittingRef.current = false;
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating || isEvaluating || !questions[currentIndex]) return;
    try {
      setIsRegenerating(true);
      const loadingToast = toast.loading("Generating a new question...");
      
      let skillsData = [];
      try {
        if (user?.skills_json) {
          skillsData = typeof user.skills_json === 'string' ? JSON.parse(user.skills_json) : user.skills_json;
          // Flatten exactly how Backend handles it
          const flat: string[] = [];
          Object.values(skillsData).forEach((arr: any) => {
             if (Array.isArray(arr)) flat.push(...arr);
          });
          skillsData = flat;
        }
      } catch (e) {}
      
      const payload = {
        current_question: questions[currentIndex].question,
        skills: skillsData.length > 0 ? skillsData : ["General Problem Solving"],
        target_role: targetRole || user?.target_role || undefined,
        experience_years: user?.experience_years || 0,
        difficulty: (user as any)?.preferred_difficulty || "intermediate"
      };
      
      const newQ = await resumeApi.regenerateQuestion(payload);
      replaceQuestion(currentIndex, newQ);
      
      toast.dismiss(loadingToast);
      toast.success("Question replaced!");
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.response?.data?.detail || "Failed to generate new question");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!questions || questions.length === 0) return null;

  // We might be evaluating the final submission
  if (isEvaluating) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-6 max-w-md"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            {/* Pulsing glow */}
            <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20"></div>
          </div>
          
          <div>
            <h2 className="text-3xl font-syne font-bold mb-2">Analyzing Performance</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our AI is evaluating your technical accuracy, communication clarity, and problem-solving approach.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  // Progress: show completed questions out of total
  const progressPercent = (currentIndex / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8">
      
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-syne text-foreground flex items-center gap-3 mb-2">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse"></span>
            Live Interview
          </h1>
          <p className="text-sm text-muted-foreground">Speak clearly. You cannot return to previous questions.</p>
        </div>
        
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Top Question display */}
          <QuestionCard
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            category={currentQ?.category || "General"}
            question={currentQ?.question || ""}
            isFollowUp={currentQ?.type === 'follow_up'}
            onReload={handleRegenerate}
            isReloading={isRegenerating}
          />

          {/* Bottom input area */}
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-[var(--shadow)]">
            <SpeechInput 
              onSubmit={handleAnswerSubmit}
              isSubmitting={isEvaluating}
            />
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-center pt-8">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-sm"
          onClick={() => {
            if(window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
              navigate('/home');
            }
          }}
        >
          Exit Interview Early
        </Button>
      </div>

    </div>
  );
};

export default Interview;
