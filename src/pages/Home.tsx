import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ScoreLineChart } from '@/components/charts/ScoreLineChart';
import { analyticsApi } from '@/api/analytics.api';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { formatDistanceToNow } from 'date-fns';
import {
  TrendingUp, Target, FileText, Calendar, ArrowRight, Check, Mic, Activity, Sparkles, Flame, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getGreeting, generateTips, HomeAnalyticsData } from '@/lib/tipEngine';

const PremiumCard: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div 
    className={`relative bg-surface border border-[var(--glass-border)] theme-border rounded-[16px] p-[20px] md:p-[24px] overflow-hidden transition-all duration-220 ease-out hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] ${className}`}
    style={style}
  >
    <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#6c63ff]/35 to-transparent" />
    {children}
  </div>
);

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: summary } = useQuery({ queryKey: ['analytics', 'summary'], queryFn: analyticsApi.getSummary });
  const { data: recentActivity, isLoading: isLoadingRecent } = useQuery({ queryKey: ['analytics', 'recent-activity'], queryFn: analyticsApi.getRecentActivity });
  const { data: lastFive } = useQuery({ queryKey: ['analytics', 'last-five'], queryFn: analyticsApi.getLastFive });
  const { data: categoryData } = useQuery({ queryKey: ['analytics', 'category-performance'], queryFn: analyticsApi.getCategoryPerformance });
  const { data: streak } = useQuery({ queryKey: ['analytics', 'interview-streak'], queryFn: analyticsApi.getInterviewStreak });
  const { data: skillsPracticed, isLoading: isLoadingSkills } = useQuery({ queryKey: ['analytics', 'skills-practiced'], queryFn: analyticsApi.getSkillsPracticed });

  const analyticsData: HomeAnalyticsData = React.useMemo(() => {
    return {
       avgScore: summary?.latest_score ?? 0,
       interviewCount: summary?.total_sessions ?? 0,
       todaySessions: streak?.week_activity?.[6]?.completed ? 1 : 0, 
       weakestCategory: categoryData?.weakest_category ?? null,
       strongestCategory: categoryData?.strongest_category ?? null,
       resumeSkills: Object.keys(categoryData?.category_averages ?? {})
    };
  }, [summary, streak, categoryData]);

  const generatedTips = React.useMemo(() => {
    const tips = generateTips(analyticsData);
    return tips.length > 0 ? tips : ["Let's get you job-ready today"];
  }, [analyticsData]);

  const [currentTip, setCurrentTip] = React.useState("");
  const [tipIndex, setTipIndex] = React.useState(0);
  const [fadeState, setFadeState] = React.useState<"in" | "out">("in");

  // Typewriter effect controller
  React.useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setFadeState("out");
    }, 6500);

    const intervalTimer = setTimeout(() => {
      setTipIndex(prev => (prev + 1) % generatedTips.length);
      setFadeState("in");
    }, 7000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(intervalTimer);
    };
  }, [tipIndex, generatedTips]);

  const currentFullText = generatedTips[tipIndex];

  React.useEffect(() => {
    setCurrentTip("");
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < currentFullText.length) {
        // use function callback to ensure correct closure
        setCurrentTip(prev => currentFullText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);
    return () => clearInterval(typeInterval);
  }, [currentFullText]);

  const targetAreasList = React.useMemo(() => {
    if (!categoryData?.category_averages) return [];
    return Object.entries(categoryData.category_averages)
      .map(([category, avg_score]) => ({ category, avg_score }))
      .sort((a, b) => a.avg_score - b.avg_score); // Lowest score first
  }, [categoryData]);

  const todayIndex = 6; 
  const maxSkillCount = React.useMemo(() => {
    if (!skillsPracticed?.length) return 1;
    return Math.max(...skillsPracticed.map(s => s.session_count));
  }, [skillsPracticed]);

  const skillColors = ['#818cf8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

  return (
    <div className="pb-[40px] selection:bg-[#6c63ff]/20">
      
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up {
          opacity: 0;
        }
        @media (prefers-reduced-motion: no-preference) {
          .anim-fade-up {
            animation: fadeSlideUp 400ms ease forwards;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-fade-up {
            opacity: 1;
            transform: none;
            transition: opacity 400ms;
          }
        }
      `}</style>

      {/* ── ROW 1: Hero Greeting ─────────────────────────── */}
      <div className="mb-[24px] anim-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-[26px] font-bold tracking-tight mb-1 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          {getGreeting(user?.name ? user.name.split(' ')[0] : 'there')}
        </h1>
        <p className={`text-[14px] text-primary font-medium transition-opacity duration-500 max-w-xl ${fadeState === "out" ? "opacity-0" : "opacity-100"}`}>
          💡 Tip: {currentTip}<span className="animate-pulse">|</span>
        </p>
      </div>

      {/* ── ROW 2: Action Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[16px]">
        {/* Resume Context */}
        <PremiumCard className="anim-fade-up cursor-pointer group flex items-start gap-4 !border-l-[3px] !border-l-[#818cf8]" style={{ animationDelay: '0ms' }}>
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[var(--icon-bg)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#818cf8]" />
          </div>
          <div className="flex-1" onClick={() => navigate('/upload-resume')}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[18px] font-semibold text-foreground">Resume Context</h3>
              {user?.experience_level && (
                <span className="bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">Active</span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground leading-[1.4] mt-1.5">
              {user?.experience_level
                ? 'Your resume is loaded. Tap here to upload a new one and recalibrate your focus.'
                : 'Upload your resume to generate personalized interview questions.'}
            </p>
          </div>
        </PremiumCard>

        {/* Start Live Session */}
        <PremiumCard className="anim-fade-up cursor-pointer group flex items-start gap-4 !bg-gradient-to-br from-[#4f46e5] to-[#6d28d9] !border-transparent !shadow-lg" style={{ animationDelay: '80ms' }}>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
          <div className="w-[44px] h-[44px] rounded-[12px] bg-white/10 flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 duration-300">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 relative z-10" onClick={() => navigate('/resume-skills')}>
            <h3 className="text-[18px] font-semibold text-white mb-1.5">Start Live Session</h3>
            <p className="text-[13px] text-white/80 leading-[1.4]">
              Launch the voice interview based on your current resume skills.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all absolute right-5 top-1/2 -translate-y-1/2 z-10" />
        </PremiumCard>
      </div>

      {/* ── ROW 3: Progress + Streak ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[16px] items-start mb-[16px]">
        {/* Left Column: Progress Card */}
        <PremiumCard className="anim-fade-up flex flex-col w-full h-full" style={{ animationDelay: '160ms' }}>
          <div className="flex justify-between items-start mb-6 w-full">
            <div className="flex items-center gap-4">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#818cf8]" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-white">Interview Progress</h3>
                <p className="text-[13px] text-[#64748b] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last: {recentActivity?.find(a => a.type === 'interview')?.date
                    ? formatDistanceToNow(new Date(recentActivity.find(a => a.type === 'interview')!.date! + (!recentActivity.find(a => a.type === 'interview')!.date!.endsWith('Z') ? 'Z' : '')), { addSuffix: true })
                    : 'None'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')} className="hidden sm:flex items-center gap-2 border-white/15 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white h-9 px-4">
              View Reports
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
            {/* Total Sessions Stat */}
            <div className="bg-white/[0.03] theme-bg rounded-[12px] p-[16px_20px] flex flex-col justify-center border border-white/10 theme-border hover:border-white/20 transition-colors">
              <div className="text-[11px] text-[#64748b] theme-text-muted font-medium mb-1 uppercase tracking-[0.1em]">Total Sessions</div>
              <div className="text-[40px] font-bold text-[#10b981] leading-none">{summary?.total_sessions || 0}</div>
            </div>

            {/* Latest Score Stat */}
            <div className="bg-white/[0.03] theme-bg rounded-[12px] p-[16px_20px] flex flex-col justify-center relative border border-white/10 theme-border hover:border-white/20 transition-colors">
              <div className="absolute top-4 right-4"><Sparkles className="w-5 h-5 text-[#818cf8]/30" /></div>
              <div className="text-[11px] text-[#64748b] theme-text-muted font-medium mb-1 uppercase tracking-[0.1em]">Latest Score</div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[40px] font-bold text-[#818cf8] leading-none">{summary?.latest_score ?? '--'}</span>
                <span className="text-[14px] text-slate-500 theme-text-muted font-medium">/100</span>
              </div>
              {summary && summary.total_sessions > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${summary.trend_percentage >= 0 ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
                    {summary.trend_percentage > 0 ? '+' : ''}{summary.trend_percentage}%
                  </span>
                  <span className="text-[13px] text-[#64748b]">from previous</span>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Right Column (Fixed 320px): Streak */}
        <PremiumCard className="anim-fade-up w-full h-full flex flex-col justify-center" style={{ animationDelay: '240ms', padding: '16px 24px' }}>
          <div className="flex items-center justify-between mb-[20px]">
            <div className="flex items-center gap-2.5">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-white/10 flex items-center justify-center">
                <Flame className="w-[18px] h-[18px] text-orange-400" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white leading-tight">{streak?.current_streak || 0}-Day Streak</h3>
                <p className="text-[11px] text-[#64748b] uppercase tracking-[0.05em] mt-0.5">Your progress</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center w-full">
            {streak?.week_activity ? streak.week_activity.map((item, idx) => {
              const isToday = idx === todayIndex;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">
                    {item.day}
                  </span>
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border
                    ${item.completed 
                      ? 'bg-[#10b981] border-[#10b981] shadow-[0_2px_8px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 border-white/10 shadow-inner'
                    }
                    ${isToday ? 'ring-2 ring-[#818cf8] ring-offset-2 ring-offset-[#0d1220]' : ''}`
                  }>
                    {item.completed 
                      ? <Check className="w-[14px] h-[14px] text-white" strokeWidth={3.5} /> 
                      : <X className="w-3 h-3 text-[#64748b] opacity-50" />
                    }
                  </div>
                </div>
              );
            }) : ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">{day}</span>
                <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
                  <X className="w-3 h-3 text-[#64748b] opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* ── ROW 4: Focus Areas ──────────────────────────── */}
      <PremiumCard className="anim-fade-up w-full mb-[16px]" style={{ animationDelay: '280ms' }}>
        <h3 className="text-[18px] font-semibold text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[#818cf8]" /> Focus Areas
        </h3>
        {targetAreasList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {targetAreasList.slice(0, 4).map((item, idx) => {
              const color = skillColors[idx % skillColors.length];
              return (
                <div key={idx} className="bg-white/[0.03] theme-bg border border-white/[0.08] theme-border rounded-[10px] px-[14px] py-[10px] flex items-center gap-2.5 group hover:border-[#6c63ff]/30 hover:bg-[#6c63ff]/10 transition-colors">
                  <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                  <span className="text-[13px] font-medium text-slate-200 theme-text truncate">{item.category}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[60px] bg-white/[0.02] rounded-[12px] border border-white/[0.04] flex items-center justify-center text-[13px] text-[#64748b] p-4 text-center">
            Complete an interview to see your focus areas.
          </div>
        )}
      </PremiumCard>


      {/* ── ROW 5: Analytics 3-col ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] w-full items-start">
        
        {/* 1. Interview Performance */}
        <PremiumCard className="anim-fade-up flex flex-col min-w-0" style={{ animationDelay: '340ms' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-semibold text-white">Interview Performance</h3>
            {lastFive && lastFive.length > 0 && (
              <div className="flex gap-3 text-[11px] font-medium uppercase tracking-wider">
                <span className="text-[#10b981]">Highest: {Math.max(...lastFive.map(i => i.score))}</span>
                <span className="text-[#ef4444]">Lowest: {Math.min(...lastFive.map(i => i.score))}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[220px]">
            {lastFive && lastFive.length > 0 ? (
              <ScoreLineChart data={lastFive} />
            ) : (
              <div className="h-full bg-white/[0.02] rounded-[12px] border border-white/[0.04] flex items-center justify-center text-[13px] text-[#64748b] p-4 text-center">
                Complete interviews to see your trend.
              </div>
            )}
          </div>
        </PremiumCard>

        {/* 2. Skills Practiced - Custom Bar Rendering */}
        <PremiumCard className="anim-fade-up flex flex-col min-w-0" style={{ animationDelay: '400ms' }}>
          <h3 className="text-[16px] font-semibold text-white">Skills Practiced</h3>
          <p className="text-[12px] text-[#64748b] mb-4">Based on interview question categories</p>
          
          <div className="flex-1 flex flex-col gap-2 min-h-[220px]">
            {isLoadingSkills ? (
              <>
                <SkeletonCard className="h-[28px] w-full bg-white/5" />
                <SkeletonCard className="h-[28px] w-full bg-white/5" />
                <SkeletonCard className="h-[28px] w-full bg-white/5" />
              </>
            ) : skillsPracticed && skillsPracticed.length > 0 ? (
              skillsPracticed.slice(0, 5).map((skill, idx) => {
                const color = skillColors[idx % skillColors.length];
                const percentage = Math.max((skill.session_count / maxSkillCount) * 100, 5); // min 5% width
                
                return (
                  <div key={idx} className="flex items-center gap-[8px] py-[6px]">
                    <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                    <span className="text-[13px] font-medium text-slate-200 theme-text flex-1 truncate">{skill.category}</span>
                    <span className="text-[12px] text-[#64748b] theme-text-muted min-w-[24px] text-right font-medium">
                      {skill.session_count}
                    </span>
                    <div className="h-[4px] rounded-[2px] bg-white/10 theme-bg w-[80px] overflow-hidden border border-white/5 theme-border">
                      {/* Using inline style for width expansion animation on mount */}
                      <div 
                        className="h-full bg-[#6c63ff] rounded-[2px] w-0" 
                        style={{ width: `${percentage}%`, transition: 'width 600ms ease 100ms' }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full bg-white/[0.02] rounded-[12px] border border-white/[0.04] flex items-center justify-center text-[13px] text-[#64748b] p-4 text-center">
                No skills yet.
              </div>
            )}
          </div>
        </PremiumCard>

        {/* 3. Recent Activity */}
        <PremiumCard className="anim-fade-up flex flex-col min-w-0" style={{ animationDelay: '460ms' }}>
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-white mb-4">
            <Activity className="w-[18px] h-[18px] text-[#818cf8]" /> Recent Activity
          </h3>
          <div className="flex-1 space-y-[8px]">
            {isLoadingRecent ? (
              <>
                <SkeletonCard className="h-[52px] w-full bg-white/5" />
                <SkeletonCard className="h-[52px] w-full bg-white/5" />
              </>
            ) : recentActivity && recentActivity.length > 0 ? (
              <>
                {recentActivity.slice(0, 4).map((activity, idx) => (
                  <div key={idx} className="p-[10px_12px] rounded-[10px] bg-white/[0.03] theme-bg hover:bg-white/[0.05] theme-surface border-[1px] border-white/[0.02] theme-border hover:border-white/[0.08] transition-colors flex justify-between items-center group cursor-pointer" onClick={() => navigate('/reports')}>
                    <div className="min-w-0 pr-2">
                      <div className="text-[13px] font-medium text-slate-200 theme-text truncate capitalize">
                        {activity.type === 'interview' ? (activity.role_applied_for || 'Interview Session') : 'Resume Upload'}
                      </div>
                      <div className="text-[11px] text-[#64748b] theme-text-muted mt-0.5">
                        {activity.date ? formatDistanceToNow(new Date(activity.date + (!activity.date.endsWith('Z') ? 'Z' : '')), { addSuffix: true }) : ''}
                      </div>
                    </div>
                    {activity.score !== null && (
                      <div className="bg-white/5 border border-transparent theme-border text-[#a5b4fc] theme-text text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] flex-shrink-0 group-hover:bg-[#6c63ff]/15 transition-colors">
                        {activity.score}/100
                      </div>
                    )}
                  </div>
                ))}
                
                {recentActivity.length > 4 && (
                  <button onClick={() => navigate('/reports')} className="w-full text-center text-[12px] font-medium text-[#818cf8] hover:text-[#a5b4fc] p-2 mt-2 transition-colors flex justify-center items-center gap-1 group">
                    View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </>
            ) : (
              <div className="h-full bg-white/[0.02] rounded-[12px] border border-white/[0.04] flex items-center justify-center text-[13px] text-[#64748b] p-4 text-center">
                No recent activity.
              </div>
            )}
          </div>
        </PremiumCard>

      </div>

    </div>
  );
};

export default Home;
