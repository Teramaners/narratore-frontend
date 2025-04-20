import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DreamVoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  disabled?: boolean;
}

export function DreamVoiceInput({
  onTranscription,
  isListening,
  setIsListening,
  disabled = false
}: DreamVoiceInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const resultRef = useRef<string>('');

  useEffect(() => {
    // Verifica se Web Speech API è supportata dal browser
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Il riconoscimento vocale non è supportato dal tuo browser.');
      return;
    }

    // Inizializza l'oggetto SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'it-IT'; // Imposta italiano come lingua di riconoscimento
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = resultRef.current;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      resultRef.current = finalTranscript;
      onTranscription(finalTranscript + interimTranscript);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      setError(`Errore nel riconoscimento vocale: ${event.error}`);
      setIsListening(false);
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription, setIsListening]);

  const toggleListening = () => {
    if (!isSupported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      resultRef.current = ''; // Resetta il risultato se si inizia una nuova registrazione
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-start mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={true}
          className="text-muted-foreground"
        >
          <MicOff className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          {error}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={cn(isListening && "animate-pulse")}
              disabled={disabled}
              aria-label={isListening ? "Interrompi registrazione" : "Inizia registrazione vocale"}
            >
              {isListening ? (
                <Mic className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isListening ? "Interrompi registrazione" : "Inizia registrazione vocale"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isListening && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={stopListening}
                variant="outline"
                size="icon"
                disabled={disabled}
                aria-label="Termina e salva registrazione"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Termina e salva registrazione
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isListening && (
        <span className="text-sm font-medium text-primary animate-pulse">
          Sto ascoltando...
        </span>
      )}

      {error && (
        <span className="text-xs text-destructive ml-2">
          {error}
        </span>
      )}
    </div>
  );
}

// Dichiaro l'interfaccia SpeechRecognition per TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}