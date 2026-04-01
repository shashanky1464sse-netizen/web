import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { resumeApi } from '@/api/resume.api';
import { useInterviewStore } from '@/store/interviewStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Extracting text from PDF' },
  { id: 2, label: 'Analyzing skills with NLP' },
  { id: 3, label: 'Detecting experience & role' },
  { id: 4, label: 'Running AI classification' },
  { id: 5, label: 'Generating interview questions' },
];

const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started, 1-5 = step index
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  };

  const startStepProgress = () => {
    // Simulate step-by-step progress based on typical processing times
    const delays = [0, 4000, 12000, 22000, 35000]; // ms offsets for each step
    delays.forEach((delay, idx) => {
      const t = setTimeout(() => setCurrentStep(idx + 1), delay);
      stepTimersRef.current.push(t);
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setCurrentStep(1);
      startStepProgress();

      // Backend returns ResumeAnalysisOut with {target_role, experience_level, skills}
      const data = await resumeApi.uploadResume(file);
      
      clearStepTimers();
      setCurrentStep(STEPS.length); // all done

      // Store in session storage so the next screen can read it
      sessionStorage.setItem('r2i_resume_analysis', JSON.stringify(data));
      
      toast.success('Resume analyzed successfully!');
      // Navigate to the skills confirmation screen
      navigate('/resume-skills');
    } catch (error: any) {
      clearStepTimers();
      setCurrentStep(0);
      console.error(error);
      // Backend returns {message: ...} or {detail: ...} or {error: ...}
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.code === 'ECONNABORTED' ? 'Request timed out — the resume may be too complex. Try a shorter PDF.' : null) ||
        'Failed to process resume. Please try a different PDF.';
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader 
        title="Upload Resume"
        description="Provide your latest PDF resume. Our NLP pipeline will extract your core competencies, tech stack, and experience level to tailor your interview."
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8"
      >
        <FileDropzone 
          onFileSelect={handleFileUpload} 
          isLoading={isUploading}
          accept={{ 'application/pdf': ['.pdf'] }}
        />

        {/* Step-by-step progress panel — only visible while uploading */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 bg-surface border border-border rounded-2xl p-6 overflow-hidden"
            >
              <p className="text-sm font-semibold text-foreground mb-5 font-syne">Analyzing your resume…</p>
              <div className="space-y-3">
                {STEPS.map((step) => {
                  const isDone = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: step.id * 0.08 }}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isDone
                            ? 'text-emerald-600 line-through decoration-emerald-400'
                            : isActive
                            ? 'text-indigo-500'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                This takes <strong>30–60 seconds</strong> — AI is processing your resume.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">1</div>
            <h4 className="font-syne font-semibold mb-2 text-foreground">Extract Skills</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">We utilize spaCy NLP to identify your programming languages, frameworks, and tools contextually.</p>
          </div>
          
          <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">2</div>
            <h4 className="font-syne font-semibold mb-2 text-foreground">Determine Role</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Your professional summary and experience establish the target difficulty and position type.</p>
          </div>
          
          <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">3</div>
            <h4 className="font-syne font-semibold mb-2 text-foreground">Generate Questions</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">A custom generative model creates unique questions challenging your specific claimed knowledge.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadResume;
