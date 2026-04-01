import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '@/api/interview.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ScoreBadge } from '@/components/interview/ScoreBadge';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { FileBarChart2, Calendar, Clock, ChevronRight, Play } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const getScorePill = (score: number | null | undefined) => {
  if (score == null) return null;
  if (score >= 80) return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Excellent</span>;
  if (score >= 60) return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Good</span>;
  return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Needs Improvement</span>;
};

const Reports: React.FC = () => {
  const navigate = useNavigate();

  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewApi.listInterviews,
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Interview History"
        description="Review past performances, track your improvement over time, and read detailed AI feedback for every technical answer."
      />

      {isLoading ? (
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-28" />)}
        </div>
      ) : error ? (
        <div className="mt-12 text-center py-16">
          <p className="text-muted-foreground text-sm">Failed to load interview history. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">Retry</Button>
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <EmptyState 
          className="mt-8"
          icon={FileBarChart2}
          title="No reports yet"
          description="Complete your first AI interview simulation to generate a detailed performance report."
          action={
            <Button onClick={() => navigate('/upload-resume')} className="mt-6 gap-2">
              <Play className="w-4 h-4 fill-current" /> Validate Skills Now
            </Button>
          }
        />
      ) : (
        <div className="space-y-4 mt-8">
          {interviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="bg-surface border-border hover:border-primary/30 transition-all cursor-pointer group rounded-[20px]"
                onClick={() => navigate(`/reports/${interview.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                    
                    <div className="flex items-center gap-5 flex-1">
                      <div className="hidden sm:flex w-12 h-12 rounded-lg bg-surface-2 border border-border items-center justify-center shrink-0">
                        <FileBarChart2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-syne font-semibold text-lg text-foreground group-hover:text-primary transition-colors flex flex-wrap items-center gap-3">
                          {interview.role_applied_for || 'Mock Technical Session'}
                          {getScorePill(interview.score)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(interview.created_at + (!interview.created_at.endsWith('Z') ? 'Z' : '')), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(interview.created_at + (!interview.created_at.endsWith('Z') ? 'Z' : '')), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-4 pl-[60px] sm:pl-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-xs text-muted-foreground mb-1">Overall Score</span>
                        <ScoreBadge score={interview.score} size="lg" />
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-surface-2 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
