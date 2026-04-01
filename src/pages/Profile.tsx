import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/api/profile.api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { getImageUrl } from '@/lib/utils';
import { Pencil, MapPin, User as UserIcon, Settings, Code } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences'>('overview');

  // Preferences State
  const [darkMode, setDarkMode] = useState(true);
  const [difficulty, setDifficulty] = useState<string>('beginner');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  const displayProfile = profile || user;

  // Sync logic for Preferences
  useEffect(() => {
    if (profile) {
      const pref = profile.preferred_difficulty || localStorage.getItem('interview_difficulty') || 'beginner';
      setDifficulty(pref);
      localStorage.setItem('interview_difficulty', pref);
    } else {
      const saved = localStorage.getItem('interview_difficulty') || 'beginner';
      setDifficulty(saved);
    }
    
    const isLight = localStorage.getItem('theme_light') === 'true';
    if (isLight) setDarkMode(false);
  }, [profile]);

  const handleDarkModeSwitch = (isDark: boolean) => {
    setDarkMode(isDark);
    if (!isDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme_light', 'true');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme_light', 'false');
    }
  };

  const handleDifficultyChange = async (val: string) => {
    setDifficulty(val);
    localStorage.setItem('interview_difficulty', val);
    try {
      await profileApi.updateProfile({ preferred_difficulty: val } as any);
    } catch (_) { /* offline */ }
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', desc: 'Core concepts and fundamentals', icon: '🟢' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Real-world problems and patterns', icon: '🟣' },
    { value: 'advanced', label: 'Advanced', desc: 'System design and edge cases', icon: '🔴' },
  ];

  if (isLoading) return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-64" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Profile & Settings" 
          description="Manage your public presence and interview preferences." 
        />
        {activeTab === 'overview' && (
          <Button onClick={() => navigate('/edit-profile')} className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" variant="default">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex p-1 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl w-max shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            activeTab === 'overview' 
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            activeTab === 'preferences' 
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          Preferences
        </button>
      </div>

      <div className="relative">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
            {/* Hero Card */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden rounded-[32px] shadow-2xl shadow-black/10 transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20">
              <div className="h-32 bg-gradient-to-r from-primary/40 via-purple-500/20 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-background to-transparent h-12"></div>
              </div>
              <CardContent className="relative px-8 pb-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
                  <Avatar className="h-32 w-32 ring-[6px] ring-background shadow-2xl shrink-0 transition-transform duration-500 hover:scale-105">
                    <AvatarImage src={getImageUrl(displayProfile?.profile_photo_url)} alt={displayProfile?.name || 'User'} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-4xl font-syne font-bold">
                      {displayProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-2 flex-1">
                    <h2 className="text-4xl font-syne font-bold text-foreground tracking-tight drop-shadow-sm">{displayProfile?.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary py-1 px-3 text-sm">
                        {displayProfile?.email || "Email not listed"}
                      </Badge>
                      {displayProfile?.location && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          {displayProfile.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>


                
                {(!displayProfile?.skills_json || Object.keys(displayProfile.skills_json).length === 0) && (
                   <div className="mt-8 flex flex-col items-center justify-center p-8 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                     <UserIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                     <p className="text-muted-foreground text-sm max-w-sm text-center">Your profile looks a bit empty. Edit your profile to add skills to stand out.</p>
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[32px] shadow-xl overflow-hidden">
               <div className="p-8">
                <h2 className="text-2xl font-syne font-bold text-foreground mb-1">App Settings</h2>
                <p className="text-sm text-muted-foreground mb-8">Customize your Resume2Interview experience to match your workflow.</p>

                <div className="space-y-10">
                  {/* Appearance */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Settings className="w-5 h-5" />
                      </div>
                      <h3 className="font-syne font-bold text-lg text-foreground tracking-tight">Appearance</h3>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-muted/10 border border-white/5 transition-colors hover:bg-muted/20">
                      <div>
                        <Label className="text-[16px] font-semibold">Interface Theme</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {darkMode ? '🌙 Deep navy — optimized for focus and night studying.' : '☀️ Clean white — easy on the eyes during the day.'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDarkModeSwitch(!darkMode)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          width: '92px',
                          height: '44px',
                          borderRadius: '99px',
                          padding: '4px',
                          border: darkMode ? '1.5px solid rgba(108,99,255,0.45)' : '1.5px solid rgba(245,158,11,0.5)',
                          backgroundColor: darkMode ? '#12162b' : '#FFF8E8',
                          boxShadow: darkMode
                            ? '0 0 20px rgba(108,99,255,0.3), inset 0 0 10px rgba(108,99,255,0.05)'
                            : '0 0 20px rgba(245,158,11,0.25), inset 0 0 10px rgba(245,158,11,0.05)',
                          transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                          cursor: 'pointer',
                        }}
                        aria-label="Toggle theme"
                      >
                        <span style={{ position: 'absolute', left: '12px', fontSize: '15px', opacity: darkMode ? 0.2 : 1, transition: 'opacity 0.3s' }}>🌙</span>
                        <span style={{ position: 'absolute', right: '12px', fontSize: '15px', opacity: darkMode ? 1 : 0.2, transition: 'opacity 0.3s' }}>☀️</span>
                        <span style={{
                          position: 'relative',
                          zIndex: 10,
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          transform: darkMode ? 'translateX(0px)' : 'translateX(48px)',
                          backgroundColor: darkMode ? '#6c63ff' : '#F59E0B',
                          boxShadow: darkMode ? '0 0 14px rgba(108,99,255,0.8)' : '0 0 14px rgba(245,158,11,0.7)',
                          transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                          {darkMode ? '🌙' : '☀️'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Difficulty */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="p-2 rounded-lg bg-primary/10 text-primary">
                         <Code className="w-5 h-5" />
                       </div>
                       <h3 className="font-syne font-bold text-lg text-foreground tracking-tight">Interview Difficulty</h3>
                    </div>
                    <p className="text-sm text-muted-foreground px-1">Select the default difficulty level for AI-generated questions in Live Interviews.</p>
                    
                    <RadioGroup value={difficulty} onValueChange={handleDifficultyChange} className="grid sm:grid-cols-3 gap-4 pt-2">
                      {difficultyOptions.map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => handleDifficultyChange(opt.value)}
                          className={`relative flex flex-col items-start gap-3 cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                            difficulty === opt.value
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 translate-y-[-2px]'
                              : 'border-border/60 hover:border-primary/40 hover:bg-white/[0.02] hover:translate-y-[-1px]'
                          }`}
                        >
                          <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                          <div className="flex items-center justify-between w-full">
                            <span className="text-2xl drop-shadow-sm">{opt.icon}</span>
                            {difficulty === opt.value && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-md">✓</div>
                            )}
                          </div>
                          <div>
                            <p className="text-[16px] font-bold text-foreground mb-1">{opt.label}</p>
                            <p className="text-[13px] text-muted-foreground leading-snug">{opt.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

               </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
