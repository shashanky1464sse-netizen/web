import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, FileText, ArrowRight, Calendar } from 'lucide-react';
import { RecentActivityItem } from '@/types/analytics.types';
import { format } from 'date-fns';

interface Props {
  data: RecentActivityItem[];
}

export const RecentActivityList: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-2 rounded-xl border border-border flex flex-col items-center justify-center p-8 text-center gap-3 h-[200px]">
        <Calendar className="w-8 h-8 text-muted-foreground theme-text-muted opacity-50" />
        <p className="text-sm text-muted-foreground theme-text-muted max-w-[250px]">
          No activity yet — complete an interview or upload your resume!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const isInterview = item.type === 'interview';
        const dateStr = item.date 
          ? format(new Date(item.date), 'MMM d, yyyy')
          : '—';

        if (isInterview) {
          return (
            <div 
              key={`activity-${idx}`}
              onClick={() => navigate(item.interview_id ? `/reports/${item.interview_id}` : '/reports')}
              className="bg-surface theme-bg border border-border theme-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-base text-foreground theme-text">Interview</h4>
                  <p className="text-xs text-muted-foreground theme-text-muted mb-1">
                    {item.role_applied_for || 'General'}
                  </p>
                  <p className="text-[11px] text-muted-foreground theme-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {dateStr}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 text-indigo-600 font-bold text-sm px-3 py-1 rounded-full">
                  {item.score !== null ? `${item.score}/100` : '--/100'}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        } else {
          return (
            <div 
              key={`activity-${idx}`}
              className="bg-surface theme-bg border border-border theme-border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-base text-foreground theme-text">Resume Updated</h4>
                  <p className="text-xs text-muted-foreground theme-text-muted mb-1">Skills extracted</p>
                  <p className="text-[11px] text-muted-foreground theme-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {dateStr}
                  </p>
                </div>
              </div>
              
              <div className="bg-emerald-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Active
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};
