import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewApi } from '@/api/interview.api';
import { ScoreBadge } from '@/components/interview/ScoreBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { SkillsBarChart } from '@/components/charts/SkillsBarChart';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: interview, isLoading, error } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.getInterview(id!),
    enabled: !!id,
  });

  // Calculate Overall Lists heavily mirroring Android's ReportDetailViewModel
  const overallReport = useMemo(() => {
    if (!interview) return null;

    let strengths: string[] = [];
    let improvements: string[] = [];
    let suggestions: string[] = [];

    interview.question_answers?.forEach(qa => {
      try {
        if (qa.strengths) {
          const arr = typeof qa.strengths === 'string' ? JSON.parse(qa.strengths) : qa.strengths;
          if (Array.isArray(arr)) strengths.push(...arr);
        }
        if (qa.improvements) {
          const arr = typeof qa.improvements === 'string' ? JSON.parse(qa.improvements) : qa.improvements;
          if (Array.isArray(arr)) improvements.push(...arr);
        }
        if (qa.suggestions) {
          const arr = typeof qa.suggestions === 'string' ? JSON.parse(qa.suggestions) : qa.suggestions;
          if (Array.isArray(arr)) suggestions.push(...arr);
        }
      } catch (e) {
        // quiet fail parse
      }
    });

    const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 6);
    const uniqueImprovements = Array.from(new Set(improvements)).slice(0, 6);
    const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 6);

    return {
      strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Responded securely to questions', 'Maintained composure'],
      improvements: uniqueImprovements.length > 0 ? uniqueImprovements : ['Dive deeper into technical architecture', 'Provide more concrete workplace examples'],
      suggestions: uniqueSuggestions.length > 0 ? uniqueSuggestions : ['Continue practicing core algorithmic principles'],
      summary: interview.summary || 'Good effort across all answers. Review specific improvements below.',
      evaluation: interview.feedback_level,
    };
  }, [interview]);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-48" />)}
    </div>
  );

  if (error || !interview || !overallReport) return (
    <div className="max-w-4xl mx-auto py-32 text-center text-muted-foreground px-4">
      Report not found.
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 pb-16">
      
      {/* Back + Title */}
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>

        <div>
          <h1 className="text-3xl font-syne font-bold text-foreground">Interview Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(interview.created_at.endsWith('Z') ? interview.created_at : interview.created_at + 'Z'), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      {/* Main Score & Summary Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-4xl font-bold font-syne mb-6 border-4 border-indigo-500/20">
            {interview.score}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4 capitalize">
            {overallReport.evaluation || 'Requires Review'}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl line-clamp-6">
            {overallReport.summary}
          </p>
        </CardContent>
      </Card>

      {/* Strengths Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-foreground">Strengths</h3>
          </div>
          <div className="space-y-2">
            {overallReport.strengths.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-emerald-500/10 p-3 rounded-xl"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                <p className="text-foreground text-sm leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-foreground">Areas for Improvement</h3>
          </div>
          <div className="space-y-2">
            {overallReport.improvements.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                <p className="text-foreground text-sm leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-foreground">Actionable Suggestions</h3>
          </div>
          <div className="space-y-2">
            {overallReport.suggestions.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-indigo-500/10 p-3 rounded-xl"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                <p className="text-foreground text-sm leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ReportDetail;
