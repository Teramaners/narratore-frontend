import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';

interface DreamVoiceOutputProps {
  text: string;
  lang?: string;
  title?: string;
}

export function DreamVoiceOutput({
  text,
  lang = 'it-IT',
  title = 'Ascolta la storia'
}: DreamVoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(1);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Inizializza l'oggetto SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth.current = window.speechSynthesis;
    } else {
      setIsSupported(false);
    }

    return () => {
      // Ferma la sintesi vocale quando il componente viene smontato
      if (synth.current && isSpeaking) {
        synth.current.cancel();
      }
    };
  }, [isSpeaking]);

  const startSpeaking = () => {
    if (!synth.current || !isSupported || !text.trim()) return;

    // Cancella eventuali sintesi vocali precedenti
    synth.current.cancel();

    // Crea un nuovo oggetto SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.volume = isMuted ? 0 : volume;
    utterance.rate = 0.9; // Leggermente più lento per una lettura più chiara
    utterance.pitch = 1;

    // Trova una voce italiana se disponibile
    if (synth.current.getVoices().length > 0) {
      const voices = synth.current.getVoices();
      const italianVoice = voices.find(voice => voice.lang.includes('it'));
      if (italianVoice) {
        utterance.voice = italianVoice;
      }
    }

    // Gestione degli eventi
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    // Salva l'oggetto utterance per poterlo controllare (pausa/ripresa)
    utteranceRef.current = utterance;

    // Avvia la sintesi vocale
    synth.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!synth.current || !isSupported) return;
    synth.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pauseOrResumeSpeaking = () => {
    if (!synth.current || !isSupported) return;

    if (isSpeaking && !isPaused) {
      // Pausa
      synth.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Riprendi
      synth.current.resume();
      setIsPaused(false);
    }
  };

  const toggleMute = () => {
    if (!utteranceRef.current) return;

    if (isMuted) {
      // Ripristina il volume precedente
      setVolume(previousVolumeRef.current);
      utteranceRef.current.volume = previousVolumeRef.current;
      setIsMuted(false);
    } else {
      // Salva il volume corrente e muta
      previousVolumeRef.current = volume;
      utteranceRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }

    // Se il volume è impostato a 0, considera come muto
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-muted-foreground">
        La sintesi vocale non è supportata dal tuo browser.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  disabled={!isSpeaking}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? "Attiva audio" : "Disattiva audio"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={pauseOrResumeSpeaking}
                  disabled={!isSpeaking}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPaused ? "Riprendi" : "Pausa"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSpeaking ? "destructive" : "default"}
                  size="sm"
                  onClick={isSpeaking ? stopSpeaking : startSpeaking}
                  disabled={!text.trim()}
                >
                  {isSpeaking ? "Ferma lettura" : "Leggi ad alta voce"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSpeaking ? "Interrompi la lettura" : "Leggi la storia ad alta voce"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <VolumeX className="h-4 w-4 text-muted-foreground" />
        <Slider 
          value={[volume]} 
          min={0} 
          max={1} 
          step={0.01} 
          onValueChange={handleVolumeChange}
          className="w-full"
          aria-label="Volume"
        />
        <Volume2 className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}