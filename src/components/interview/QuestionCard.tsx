import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, GitBranch, Volume2 } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
  isCompleted?: boolean;
  isFollowUp?: boolean;
  onReload?: () => void;
  isReloading?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  questionNumber, 
  totalQuestions, 
  category, 
  question,
  isCompleted = false,
  isFollowUp = false,
  onReload,
  isReloading = false,
}) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Pick the most natural sounding en-US voice available
      // (matches Android's default TextToSpeech engine quality)
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;
        const preferred = voices.find(v =>
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||       // macOS
          v.name.includes('Microsoft Zira')    // Windows
        ) || voices.find(v => v.lang === 'en-US' && !v.localService)
          || voices.find(v => v.lang.startsWith('en-'))
          || voices[0];
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      };

      // voices may not be loaded yet on first call
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        pickVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          pickVoice();
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    }
  };

  return (
    <Card className={`border-border transition-colors ${isCompleted ? 'bg-surface-2 border-primary/20' : 'bg-surface shadow-[var(--shadow)]'}`}>
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isCompleted ? "outline" : "default"} className={!isCompleted ? "bg-primary text-white hover:bg-primary-dim" : "text-muted-foreground border-border"}>
              {category}
            </Badge>
            {isFollowUp && (
              <Badge variant="outline" className="border-amber-400/60 text-amber-500 bg-amber-500/10 gap-1 text-[11px]">
                <GitBranch className="w-3 h-3" />
                Follow-up
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Question {questionNumber} of {totalQuestions}</span>
            {isCompleted && <CheckCircle2 className="w-5 h-5 text-success" />}
          </div>
        </div>
        
        <div className="flex items-start justify-between gap-4 mt-2">
          <h2 className={`text-xl sm:text-2xl font-syne font-medium leading-relaxed ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
            {question}
          </h2>
          {!isCompleted && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {onReload && (
                <button 
                  onClick={onReload}
                  disabled={isReloading}
                  className="p-2 -mr-2 rounded-full hover:bg-surface-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  title="Change Question"
                  aria-label="Change Question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isReloading ? "animate-spin" : ""}>
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                </button>
              )}
              <button 
                onClick={handleSpeak}
                className="p-2 -mr-2 rounded-full hover:bg-surface-2 text-muted-foreground hover:text-primary transition-colors"
                title="Read Question Aloud"
                aria-label="Read Question Aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
