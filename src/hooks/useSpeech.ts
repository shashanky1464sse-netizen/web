import { useState, useEffect, useCallback, useRef } from 'react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  hasRecognitionSupport: boolean;
}

export const useSpeech = (): UseSpeechReturn => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    // Check if window is defined (for SSR safety, though this is Vite SPA)
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setHasRecognitionSupport(true);
        recognitionRef.current = new SpeechRecognition();
        
        // Configuration
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        // Get preferred language from localStorage or default to en-US
        const prefs = localStorage.getItem('r2i_prefs');
        let lang = 'en-US';
        if (prefs) {
          try {
            const parsed = JSON.parse(prefs);
            if (parsed.interviewLanguage === 'Hindi') lang = 'hi-IN';
          } catch (e) {
            // ignore JSON parse error
          }
        }
        recognitionRef.current.lang = lang;

        recognitionRef.current.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          // Iterate through results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              currentFinal += transcriptSegment;
            } else {
              currentInterim += transcriptSegment;
            }
          }

          setInterimTranscript(currentInterim);
          if (currentFinal) {
            // Update the final transcript state
            setTranscript(currentFinal);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (!manualStopRef.current && isListening) {
             // Try to restart if we were listening and didn't manually stop
             try {
                recognitionRef.current.start();
             } catch (e) {
                console.error("Failed to auto-restart speech:", e);
                setIsListening(false);
                setInterimTranscript('');
             }
          } else {
             setIsListening(false);
             setInterimTranscript('');
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setInterimTranscript('');
        manualStopRef.current = false;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    start,
    stop,
    reset,
    hasRecognitionSupport
  };
};
