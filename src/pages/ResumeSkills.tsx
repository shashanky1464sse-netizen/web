import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, AlertCircle, ArrowRight, Edit2, X, Plus, Check } from 'lucide-react';
import { resumeApi } from '@/api/resume.api';
import { profileApi } from '@/api/profile.api';
import { useInterviewStore } from '@/store/interviewStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function ResumeSkills() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setQuestions, setTargetRole: setGlobalTargetRole } = useInterviewStore();
  const { user, updateUser } = useAuthStore();
  
  const [targetRole, setTargetRole] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>('beginner'); // synced with profile
  const [categorizedSkills, setCategorizedSkills] = useState<Record<string, string[]>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('languages');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    // Refresh the user profile in background to avoid stale skills_json
    profileApi.getProfile().then(profile => {
      if (active) updateUser(profile as any);
    }).catch(console.error);

    return () => { active = false; }
  }, []); // Run ONCE on mount only

  const hasLoadedOriginalData = React.useRef(false);

  useEffect(() => {
    if (hasLoadedOriginalData.current) return;

    // 1st priority: Newly uploaded resume data
    const sessionData = sessionStorage.getItem('r2i_resume_analysis');
    
    // Check if we actually have data to load before we mark as loaded
    if (sessionData) {
      hasLoadedOriginalData.current = true;
      try {
        const parsed = JSON.parse(sessionData);
        setTargetRole(parsed.inferred_target_role || parsed.target_role || 'Software Engineer');
        setExperienceLevel(parsed.experience_level || 'Intermediate');
        setExperienceYears(parsed.detected_experience_years ?? 3);
        
        let skillsBucket: Record<string, string[]> = {};
        if (parsed.technical_skills) {
           skillsBucket = { ...parsed.technical_skills };
        } else if (parsed.skills) {
           skillsBucket = { ...parsed.skills };
        }
        
        if (parsed.soft_skills && Array.isArray(parsed.soft_skills)) {
          skillsBucket['soft_skills'] = parsed.soft_skills;
        }
        
        if (parsed.ai_classified_skills) {
          const ai = parsed.ai_classified_skills as {
            technical_skills?: string[];
            tools_frameworks?: string[];
            soft_skills?: string[];
          };
          if (ai.technical_skills?.length) {
            skillsBucket['languages'] = [
              ...(skillsBucket['languages'] || []),
              ...ai.technical_skills,
            ].filter((v, i, a) => a.indexOf(v) === i);
          }
          if (ai.tools_frameworks?.length) {
            skillsBucket['tools_frameworks'] = [
              ...(skillsBucket['tools_frameworks'] || []),
              ...ai.tools_frameworks,
            ].filter((v, i, a) => a.indexOf(v) === i);
          }
          if (ai.soft_skills?.length) {
            skillsBucket['soft_skills'] = [
              ...(skillsBucket['soft_skills'] || []),
              ...ai.soft_skills,
            ].filter((v, i, a) => a.indexOf(v) === i);
          }
        }
        
        setCategorizedSkills(skillsBucket || {});
        
        const allSkills: string[] = [];
        Object.values(skillsBucket || {}).forEach(arr => {
          if (Array.isArray(arr)) {
            allSkills.push(...arr);
          }
        });
        setSelectedSkills(allSkills);
      } catch (e) {
        console.error("Failed parsing resume session data");
      }
    } 
    // 2nd priority: Already active profile data
    else if (user?.experience_level && user?.skills_json) {
      hasLoadedOriginalData.current = true;
      setTargetRole(user.target_role || 'Software Engineer');
      setExperienceLevel(user.experience_level);
      setExperienceYears(user.experience_years ?? 3);
      if ((user as any).preferred_difficulty) setDifficulty((user as any).preferred_difficulty);
      
      let skillsBucket: Record<string, string[]> = {};
      try {
        skillsBucket = typeof user.skills_json === 'string' ? JSON.parse(user.skills_json) : user.skills_json;
      } catch(e) {}
      
      setCategorizedSkills(skillsBucket || {});
      
      const allSkills: string[] = [];
      Object.values(skillsBucket || {}).forEach(arr => {
        if (Array.isArray(arr)) {
          allSkills.push(...arr);
        }
      });
      setSelectedSkills(allSkills);
    }
    // 3rd Priority: Bounce to upload (only if user is actually loaded but empty)
    else if (user) {
      // Don't mark as loaded yet if user is still fetching (null)
      toast("Please upload a resume first to generate questions.");
      navigate('/upload-resume');
    }
  }, [user?.skills_json, user?.experience_level, user, navigate]); // Intentionally avoid depending on the whole `user` object to prevent looping

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleGenerateQuestions = async () => {
    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill.");
      return;
    }

    try {
      setIsGenerating(true);
      toast("Generating custom questions. This takes ~15-30s...", { icon: '⏳', duration: 5000 });
      
      // difficulty is now synced from profile (preferred_difficulty)
      // no localStorage fallback needed

      // ── Separate skills into correct buckets for the API payload ──────────────
      // Sending soft skills in the flat 'skills' array causes bucket_skills() to
      // put them in 'misc', which Android then treats as Technical Skills.
      const SOFT_SKILL_CATS = ['soft_skills', 'interpersonal'];
      const TOOLS_CATS = ['web', 'backend', 'frontend', 'mobile', 'devops', 'testing',
                          'frameworks', 'tools', 'technologies', 'tools_frameworks'];

      const softSelected: string[] = [];
      const toolsSelected: string[] = [];
      const techSelected: string[] = [];

      Object.entries(categorizedSkills).forEach(([cat, catSkills]) => {
        if (!Array.isArray(catSkills)) return;
        catSkills.forEach(skill => {
          if (!selectedSkills.includes(skill)) return;
          if (SOFT_SKILL_CATS.includes(cat)) {
            softSelected.push(skill);
          } else if (TOOLS_CATS.includes(cat)) {
            toolsSelected.push(skill);
          } else {
            // languages, database, ai, architecture, misc, etc. → technical
            techSelected.push(skill);
          }
        });
      });

      const payload = {
        skills: techSelected,
        soft_skills: softSelected,
        tools_frameworks: toolsSelected,
        target_role: targetRole,
        experience_years: experienceYears,
        difficulty
      };
      
      const res = await resumeApi.generateQuestions(payload);
      
      // Backend returns 'generated_questions', not 'questions'
      setQuestions(res.generated_questions);
      setGlobalTargetRole(targetRole);
      
      // Clear session data if we wanted to
      sessionStorage.removeItem('r2i_resume_analysis');
      
      toast.success("Ready! Starting interview.");
      navigate('/interview');
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "AI question generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomSkill = () => {
    if (!newSkillText.trim()) return;
    const skill = newSkillText.trim();
    
    const updated = { ...categorizedSkills };
    if (!updated[newSkillCategory]) updated[newSkillCategory] = [];
    if (!updated[newSkillCategory].includes(skill)) {
      updated[newSkillCategory] = [...updated[newSkillCategory], skill];
      setCategorizedSkills(updated);
      // Auto-select newly added skill
      setSelectedSkills(prev => [...prev, skill]);
      setNewSkillText('');
      toast.success(`"${skill}" added!`);
    } else {
      toast.error('Skill already exists.');
    }
  };

  // category here is the ACTUAL key in categorizedSkills (e.g. 'languages', 'soft_skills')
  const handleRemoveSkill = (categoryKey: string, skill: string) => {
    const updated = { ...categorizedSkills };
    if (updated[categoryKey]) {
      updated[categoryKey] = updated[categoryKey].filter(s => s !== skill);
    }
    setCategorizedSkills(updated);
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSaveSkillsToProfile = async () => {
    try {
      setIsSaving(true);

      // Collapse all categorized skills into the canonical 3-bucket structure
      // that both Android and Web understand.
      const TECH_CATS = ['languages', 'database', 'ai', 'architecture', 'programming_languages',
                         'databases', 'cloud', 'technical', 'core_skills', 'misc'];
      const TOOLS_CATS = ['web', 'backend', 'frontend', 'mobile', 'devops', 'testing',
                          'frameworks', 'tools', 'technologies', 'tools_frameworks'];
      const SOFT_CATS  = ['soft_skills', 'interpersonal'];

      const techArr: string[] = [];
      const toolsArr: string[] = [];
      const softArr: string[] = [];
      const seen = new Set<string>();

      Object.entries(categorizedSkills).forEach(([cat, catSkills]) => {
        if (!Array.isArray(catSkills)) return;
        catSkills.forEach(skill => {
          const key = skill.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          if (SOFT_CATS.includes(cat))       softArr.push(skill);
          else if (TOOLS_CATS.includes(cat)) toolsArr.push(skill);
          else                                techArr.push(skill); // TECH_CATS + misc
        });
      });

      const normalizedSkills: Record<string, string[]> = {};
      if (techArr.length)  normalizedSkills['languages']       = techArr;
      if (toolsArr.length) normalizedSkills['tools_frameworks'] = toolsArr;
      if (softArr.length)  normalizedSkills['soft_skills']     = softArr;

      const updated = await profileApi.updateProfile({
        skills_json: JSON.stringify(normalizedSkills),
        target_role: targetRole,
        experience_level: experienceLevel,
        experience_years: experienceYears,
        preferred_difficulty: difficulty,
      } as any);
      
      // Sync the auth store so the updated skills persist for the rest of the session
      if (updated) updateUser(updated as any);

      // Invalidate React Query cache so Home.tsx picks up new skill counts immediately
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      
      toast.success('Profile updated successfully.');
      setIsEditingSkills(false);
    } catch (e: any) {
      console.error("Profile Save Error:", e.response?.data || e.message);
      toast.error(e.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group skills into the 3 explicit categories requested by user
  const groupedSkills = React.useMemo(() => {
    const groups: Record<string, string[]> = {
      "Technical Skills": [],
      "Soft Skills": [],
      "Tools & Frameworks": [],
    };

    Object.entries(categorizedSkills).forEach(([category, skills]) => {
      if (!Array.isArray(skills)) return;
      
      if (['languages', 'database', 'ai', 'architecture', 'programming_languages', 'databases', 'cloud', 'technical', 'core_skills'].includes(category)) {
        groups["Technical Skills"].push(...skills);
      } else if (['web', 'backend', 'frontend', 'mobile', 'devops', 'testing', 'frameworks', 'tools', 'technologies', 'tools_frameworks'].includes(category)) {
        groups["Tools & Frameworks"].push(...skills);
      } else {
        // Everything else (soft_skills, interpersonal, misc, communication) → Soft Skills
        groups["Soft Skills"].push(...skills);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, skills]) => skills.length > 0)
    );
  }, [categorizedSkills]);

  const sortedCategories = Object.keys(groupedSkills).sort((a, b) => {
    const order = ["Technical Skills", "Tools & Frameworks", "Soft Skills"];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <PageHeader 
        title="Interview Configuration" 
        description="Verify the extracted parameters and select the skills you want to be tested on during this session."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meta info card */}
        <Card className="bg-surface border-border md:col-span-1 border-l-4 border-l-emerald-500 shadow-sm h-fit">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-syne font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Target Profile</h3>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-200">
                Active
              </span>
            </div>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Role you're prepping for</p>
                {isEditingSkills ? (
                  <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full bg-surface-2 border border-border rounded-md px-2 py-1.5 text-sm text-foreground mt-1 focus:outline-none focus:border-indigo-500/50" />
                ) : (
                  <p className="font-medium text-foreground">{targetRole}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Experience Overview (Level, Years)</p>
                {isEditingSkills ? (
                  <div className="flex gap-2 mt-1">
                     <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="bg-surface-2 border border-border rounded-md px-2 py-1.5 text-sm text-foreground flex-1 focus:outline-none focus:border-indigo-500/50">
                       <option value="Beginner">Beginner</option>
                       <option value="Intermediate">Intermediate</option>
                       <option value="Expert">Expert</option>
                     </select>
                     <input type="number" min={0} value={experienceYears} onChange={e => setExperienceYears(parseInt(e.target.value)||0)} className="w-20 bg-surface-2 border border-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-indigo-500/50" />
                  </div>
                ) : (
                  <p className="font-medium text-foreground">{experienceLevel}{experienceYears > 0 ? `, ${experienceYears} Years` : ''}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Questions will be calibrated to this specific difficulty level.</p>
            </div>
          </CardContent>
        </Card>

        {/* Skills Selection */}
        <Card className="bg-surface border-border md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-syne font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Skills Extracted</h3>
                <button 
                  onClick={() => setIsEditingSkills(!isEditingSkills)} 
                  className={`p-1.5 rounded-md transition-colors ${isEditingSkills ? 'bg-[#6c63ff]/20 text-[#6c63ff]' : 'hover:text-[#6c63ff]'}`} style={{ color: isEditingSkills ? undefined : 'var(--color-text-muted)' }}
                  title="Edit Skills"
                >
                  <Edit2 className="w-[14px] h-[14px]" />
                </button>
              </div>
              
              {isEditingSkills ? (
                <Button 
                  size="sm" 
                  onClick={handleSaveSkillsToProfile}
                  disabled={isSaving}
                  className="bg-[#6c63ff] hover:bg-[#5b54d6] text-white h-8 text-xs font-medium"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Check className="w-3 h-3 mr-1.5" />}
                  Save Changes
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{selectedSkills.length}</span> selected
                </p>
              )}
            </div>

            {sortedCategories.length === 0 && !isEditingSkills ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                No technical skills extracted. You can still generate general questions.
              </div>
            ) : (
              <div className="space-y-6">
                {isEditingSkills && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 p-3 rounded-lg bg-surface-2 border border-border">
                    <input 
                      type="text" 
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                      placeholder="Add a custom skill missed by AI..." 
                      className="flex-1 bg-transparent border-none text-sm outline-none min-w-[200px]" style={{ color: 'var(--color-text)' }}
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={newSkillCategory} 
                        onChange={e => setNewSkillCategory(e.target.value)} 
                        className="border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none flex-1 sm:flex-none" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)' }}
                      >
                        <option value="languages">Technical Skills</option>
                        <option value="tools_frameworks">Tools & Frameworks</option>
                        <option value="soft_skills">Soft Skills</option>
                      </select>
                      <Button size="sm" variant="secondary" onClick={handleAddCustomSkill} className="h-7 text-xs px-3">
                        <Plus className="w-3 h-3 mr-1.5" /> Add
                      </Button>
                    </div>
                  </div>
                )}
                
                {sortedCategories.map(category => {
                  return (
                    <div key={category}>
                      <h4 className="text-sm font-semibold mb-3 font-syne tracking-wide" style={{ color: 'var(--color-text)' }}>
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills[category].map(skill => {
                          const isSelected = selectedSkills.includes(skill);
                          
                          // Per-skill reverse-lookup: find the exact key in categorizedSkills that holds this skill
                          const skillCategoryKey = Object.keys(categorizedSkills).find(
                            key => Array.isArray(categorizedSkills[key]) && categorizedSkills[key].includes(skill)
                          ) || 'misc';
                          
                          if (isEditingSkills) {
                            return (
                              <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                                {skill}
                                <button 
                                  onClick={() => handleRemoveSkill(skillCategoryKey, skill)} 
                                  className="hover:text-red-400 p-0.5 rounded-full hover:bg-red-400/10 transition-colors" 
                                  style={{ color: 'var(--color-text-dim)' }}
                                  title={`Remove ${skill}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border 
                                ${isSelected 
                                  ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/20 shadow-sm' 
                                  : 'border-border'
                                }`}
                              style={!isSelected ? { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' } : undefined}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload-resume')}
                disabled={isGenerating || isEditingSkills}
              >
                Start Over
              </Button>
              <Button 
                onClick={handleGenerateQuestions} 
                disabled={isGenerating || selectedSkills.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px] gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Generate & Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
