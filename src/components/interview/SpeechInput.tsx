import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, AlertCircle } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface SpeechInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({ onSubmit, isSubmitting = false }) => {
  const { transcript, interimTranscript, isListening, start, stop, reset, hasRecognitionSupport } = useSpeech();
  const [localText, setLocalText] = useState('');

  // Update local text area when speech recognition gives final results
  useEffect(() => {
    if (transcript) {
      setLocalText(prev => prev ? `${prev} ${transcript}` : transcript);
      reset(); // Clear transcript so it doesn't repeatedly append
    }
  }, [transcript, reset]);

  const handleToggleListen = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const handleSubmit = () => {
    if (localText.trim()) {
      onSubmit(localText.trim());
      setLocalText('');
      if (isListening) stop();
    }
  };

  if (!hasRecognitionSupport) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">Browser Not Supported</h4>
          <p className="text-sm">Your browser doesn't support the Web Speech API required for voice recording. Please use Chrome or Edge, or type your answer directly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          placeholder="Speak your answer or type it here..."
          className="w-full min-h-[160px] p-4 rounded-xl bg-surface-3 border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-y text-foreground placeholder:text-text-dim transition-all font-mono text-[15px] leading-[145%]"
          disabled={isSubmitting}
        />
        
        {isListening && interimTranscript && (
          <div className="absolute bottom-4 left-4 right-4 bg-surface-2/90 backdrop-blur border border-border p-3 flex rounded-lg pointer-events-none">
            <span className="text-muted-foreground italic mr-2 animate-pulse">Listening...</span>
            <span className="text-foreground italic">{interimTranscript}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          type="button"
          onClick={handleToggleListen}
          variant={isListening ? "destructive" : "outline"}
          className={`w-full sm:w-auto gap-2 ${isListening ? 'animate-pulse bg-destructive hover:bg-destructive/90 text-white' : 'bg-surface hover:bg-surface-2 border-border text-foreground hover:text-foreground'}`}
          disabled={isSubmitting}
        >
          {isListening ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Start Speaking
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!localText.trim() || isSubmitting}
          className="w-full sm:w-auto gap-2 bg-primary text-white hover:bg-primary-dim"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
        </Button>
      </div>
    </div>
  );
};
