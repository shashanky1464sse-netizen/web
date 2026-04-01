import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { useInterviewStore } from '@/store/interviewStore';
import { motion } from 'framer-motion';

const InterviewSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { reset } = useInterviewStore();
  const [interviewId, setInterviewId] = useState<string | null>(null);

  useEffect(() => {
    // Clear the active interview state
    reset();
    
    // Get the ID of the newly created interview
    const id = sessionStorage.getItem('r2i_last_interview_id');
    setInterviewId(id);
    
    // Cleanup temporary resume data
    sessionStorage.removeItem('r2i_resume_analysis');
  }, [reset]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="bg-surface border-border overflow-hidden shadow-[var(--shadow)] relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-success"></div>
          
          <CardContent className="pt-12 pb-10 px-8 flex flex-col items-center text-center">
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-success" />
            </motion.div>
            
            <h1 className="text-3xl font-syne font-bold text-foreground mb-4">
              Simulation Complete
            </h1>
            
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Great job! Your responses have been processed by our AI evaluation engine. 
              Comprehensive feedback, scoring, and improvement suggestions are now available.
            </p>
            
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate(interviewId ? `/reports/${interviewId}` : '/reports')}
                className="flex-1 h-12 text-base font-medium shadow-md gap-2"
              >
                <FileText className="w-4 h-4" />
                View Full Report
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/home')}
                className="flex-1 h-12 text-base font-medium gap-2 bg-surface text-foreground border-border hover:bg-surface-2"
              >
                Return Home
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InterviewSuccess;
