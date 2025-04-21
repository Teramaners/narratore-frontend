import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Volume2, Play, Pause, SkipBack, Speaker, Music, Headphones, Mic, Volume1, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

interface DreamAudioStorytellingProps {
  dreamContent: string;
  dreamStory: string;
  emotion: string;
}

type Voice = {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female';
};

export function DreamAudioStorytelling({ dreamStory, emotion }: DreamAudioStorytellingProps) {
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [enableAmbience, setEnableAmbience] = useState<boolean>(true);
  const [ambienceVolume, setAmbienceVolume] = useState<number>(0.3);
  const [ambienceType, setAmbienceType] = useState<string>('default');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synth = window.speechSynthesis;
  const ambiencePlayerRef = useRef<Tone.Player | null>(null);
  const currentPositionRef = useRef<number>(0);
  const totalLengthRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  
  // Liste di effetti sonori ambientali per diverse emozioni
  const ambienceSounds = {
    default: {
      url: 'https://freesound.org/data/previews/419/419507_7252851-lq.mp3', // Suono ambientale neutro
      description: 'Ambiente generico'
    },
    avventura: {
      url: 'https://freesound.org/data/previews/456/456385_9498599-lq.mp3', // Foresta avventurosa
      description: 'Ambiente avventuroso'
    },
    spaventoso: {
      url: 'https://freesound.org/data/previews/368/368403_5503256-lq.mp3', // Atmosfera inquietante
      description: 'Atmosfera inquietante'
    },
    romantico: {
      url: 'https://freesound.org/data/previews/530/530038_7210101-lq.mp3', // Pianoforte romantico
      description: 'Musica romantica'
    },
    surreale: {
      url: 'https://freesound.org/data/previews/451/451591_7572453-lq.mp3', // Suoni eterei
      description: 'Ambiente surreale'
    },
    tranquillo: {
      url: 'https://freesound.org/data/previews/451/451517_6142149-lq.mp3', // Onde del mare calme
      description: 'Onde del mare'
    },
  };

  // Funzione per determinare l'ambience in base all'emozione
  const getAmbienceForEmotion = (emotion: string): string => {
    switch (emotion.toLowerCase()) {
      case 'paura':
      case 'terrore':
      case 'ansia':
        return 'spaventoso';
      case 'gioia':
      case 'felicità':
      case 'eccitazione':
        return 'avventura';
      case 'amore':
      case 'passione':
        return 'romantico';
      case 'stupore':
      case 'confusione':
        return 'surreale';
      case 'calma':
      case 'pace':
      case 'serenità':
        return 'tranquillo';
      default:
        return 'default';
    }
  };
  
  // Carica le voci disponibili all'avvio
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      
      // Filtra solo le voci italiane o inglesi
      const filteredVoices = availableVoices
        .filter(voice => voice.lang.includes('it') || voice.lang.includes('en'))
        .map(voice => ({
          id: voice.voiceURI,
          name: voice.name,
          lang: voice.lang,
          gender: (voice.name.toLowerCase().includes('female') || 
                  voice.name.toLowerCase().includes('donna')) ? 'female' as const : 'male' as const
        }));
      
      setVoices(filteredVoices);
      
      // Seleziona automaticamente una voce italiana se disponibile
      const italianVoice = filteredVoices.find(voice => voice.lang.includes('it'));
      if (italianVoice) {
        setSelectedVoice(italianVoice.id);
      } else if (filteredVoices.length > 0) {
        setSelectedVoice(filteredVoices[0].id);
      }
    };
    
    // Carica le voci quando sono disponibili
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    // Imposta il tipo di ambiente basato sull'emozione
    setAmbienceType(getAmbienceForEmotion(emotion));
    
    // Cleanup al dismount
    return () => {
      stopPlayback();
      if (ambiencePlayerRef.current) {
        ambiencePlayerRef.current.stop();
        ambiencePlayerRef.current.dispose();
      }
    };
  }, [emotion]);
  
  // Inizializza Tone.js per l'audio ambientale
  useEffect(() => {
    async function setupTone() {
      try {
        await Tone.start();
        console.log('Tone.js initialized');
      } catch (error) {
        console.error('Error initializing Tone.js:', error);
      }
    }
    
    setupTone();
  }, []);
  
  // Funzione per iniziare la riproduzione vocale
  const startPlayback = async () => {
    if (dreamStory.trim() === '') {
      toast({
        variant: "destructive",
        description: "Nessuna storia da narrare. Genera prima una storia dal tuo sogno.",
      });
      return;
    }
    
    if (!selectedVoice) {
      toast({
        variant: "destructive",
        description: "Seleziona una voce prima di iniziare la riproduzione.",
      });
      return;
    }
    
    try {
      // Ferma eventuali riproduzioni in corso
      stopPlayback();
      
      // Inizializza un nuovo utterance
      const utterance = new SpeechSynthesisUtterance(dreamStory);
      utteranceRef.current = utterance;
      
      // Imposta i parametri della voce
      const selectedVoiceObj = synth.getVoices().find(voice => voice.voiceURI === selectedVoice);
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        
        // Avvia l'ambience se attivato
        if (enableAmbience) {
          playAmbience();
        }
        
        // Inizia a tracciare il progresso
        totalLengthRef.current = dreamStory.length;
        
        // Aggiorna il progresso periodicamente
        intervalRef.current = window.setInterval(() => {
          const currentChar = synth.speaking ? currentPositionRef.current : totalLengthRef.current;
          const percentage = Math.min(100, Math.round((currentChar / totalLengthRef.current) * 100));
          setProgress(percentage);
        }, 100);
      };
      
      utterance.onpause = () => setIsPlaying(false);
      utterance.onresume = () => setIsPlaying(true);
      
      utterance.onboundary = (event) => {
        currentPositionRef.current = event.charIndex;
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        
        // Ferma il monitoraggio del progresso
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Ferma l'ambience con fade out
        if (ambiencePlayerRef.current) {
          stopAmbience(true);
        }
        
        toast({
          description: "Narrazione completata.",
        });
      };
      
      utterance.onerror = (event) => {
        console.error('Errore nella sintesi vocale:', event);
        setIsPlaying(false);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if (ambiencePlayerRef.current) {
          stopAmbience();
        }
        
        toast({
          variant: "destructive",
          description: "Si è verificato un errore durante la narrazione.",
        });
      };
      
      // Avvia la sintesi vocale
      synth.speak(utterance);
      
    } catch (error) {
      console.error('Errore nell\'avvio della riproduzione:', error);
      toast({
        variant: "destructive",
        description: "Errore nell'avvio della narrazione. Riprova.",
      });
    }
  };
  
  // Funzione per mettere in pausa/riprendere la riproduzione
  const togglePlayback = () => {
    if (synth.speaking) {
      if (synth.paused) {
        synth.resume();
        if (ambiencePlayerRef.current) {
          ambiencePlayerRef.current.volume.rampTo(ambienceVolume, 0.5);
        }
      } else {
        synth.pause();
        if (ambiencePlayerRef.current) {
          ambiencePlayerRef.current.volume.rampTo(0, 0.5);
        }
      }
    } else {
      startPlayback();
    }
  };
  
  // Funzione per fermare la riproduzione
  const stopPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    synth.cancel();
    stopAmbience();
    setIsPlaying(false);
    setProgress(0);
    currentPositionRef.current = 0;
  };
  
  // Funzione per avviare l'audio ambientale
  const playAmbience = async () => {
    try {
      if (ambiencePlayerRef.current) {
        ambiencePlayerRef.current.stop();
        ambiencePlayerRef.current.dispose();
      }
      
      // Ottieni l'URL del suono in base al tipo di ambiente
      const soundUrl = ambienceSounds[ambienceType as keyof typeof ambienceSounds]?.url || ambienceSounds.default.url;
      
      // Imposta il nuovo player con l'audio ambientale
      const player = new Tone.Player({
        url: soundUrl,
        loop: true,
        volume: -Infinity, // Inizia silenzioso per il fade in
        onload: () => {
          player.start();
          player.volume.rampTo(ambienceVolume, 2); // Fade in in 2 secondi
        }
      }).toDestination();
      
      ambiencePlayerRef.current = player;
    } catch (error) {
      console.error('Errore nell\'avvio dell\'audio ambientale:', error);
    }
  };
  
  // Funzione per fermare l'audio ambientale
  const stopAmbience = (withFade = false) => {
    if (ambiencePlayerRef.current) {
      if (withFade) {
        // Fade out e poi stop
        ambiencePlayerRef.current.volume.rampTo(-Infinity, 2);
        setTimeout(() => {
          if (ambiencePlayerRef.current) {
            ambiencePlayerRef.current.stop();
          }
        }, 2000);
      } else {
        // Stop immediato
        ambiencePlayerRef.current.stop();
      }
    }
  };
  
  // Funzione per cambiare il tipo di ambiente
  const changeAmbienceType = (type: string) => {
    setAmbienceType(type);
    
    // Se è in riproduzione, aggiorna l'audio ambientale
    if (isPlaying && enableAmbience) {
      playAmbience();
    }
  };
  
  // Funzione per cambiare il volume dell'ambiente
  const changeAmbienceVolume = (value: number) => {
    setAmbienceVolume(value);
    if (ambiencePlayerRef.current) {
      ambiencePlayerRef.current.volume.rampTo(value, 0.1);
    }
  };
  
  // Ottiene la descrizione del tipo di ambiente corrente
  const getAmbienceDescription = (): string => {
    return ambienceSounds[ambienceType as keyof typeof ambienceSounds]?.description || 'Ambiente generico';
  };
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Headphones className="h-5 w-5 mr-2" />
          Audio Storytelling Avanzato
        </CardTitle>
        <CardDescription>
          Ascolta la narrazione della tua storia con effetti sonori ambientali
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selezione della voce */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            Voce del narratore
          </Label>
          <Select 
            value={selectedVoice} 
            onValueChange={setSelectedVoice}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una voce" />
            </SelectTrigger>
            <SelectContent>
              {voices.map(voice => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Controlli di riproduzione */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline"
            size="icon"
            onClick={stopPlayback}
            disabled={!isPlaying && progress === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={isPlaying ? "destructive" : "default"}
            className="px-8"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? "Pausa" : "Riproduci"}
          </Button>
          
          <div className="flex items-center gap-2">
            {volume <= 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <Slider
              className="w-20"
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
        </div>
        
        {/* Barra di progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Impostazioni avanzate */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate" className="flex items-center">
              <span>Velocità:</span>
            </Label>
            <div className="flex items-center gap-2">
              <Slider
                id="rate"
                className="w-32"
                value={[rate]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => setRate(value[0])}
              />
              <span className="text-xs w-8 text-muted-foreground">{rate}x</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="pitch" className="flex items-center">
              <span>Tono:</span>
            </Label>
            <div className="flex items-center gap-2">
              <Slider
                id="pitch"
                className="w-32"
                value={[pitch]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => setPitch(value[0])}
              />
              <span className="text-xs w-8 text-muted-foreground">{pitch}x</span>
            </div>
          </div>
        </div>
        
        {/* Controlli audio ambientale */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center">
              <Music className="h-4 w-4 mr-2" />
              Audio ambientale
            </Label>
            <Switch 
              checked={enableAmbience}
              onCheckedChange={(checked) => {
                setEnableAmbience(checked);
                if (checked && isPlaying) {
                  playAmbience();
                } else if (!checked && ambiencePlayerRef.current) {
                  stopAmbience(true);
                }
              }}
            />
          </div>
          
          {enableAmbience && (
            <>
              <div className="space-y-2">
                <Label className="text-sm">Tipo di ambiente</Label>
                <Select 
                  value={ambienceType} 
                  onValueChange={changeAmbienceType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Ambiente generico</SelectItem>
                    <SelectItem value="avventura">Ambiente avventuroso</SelectItem>
                    <SelectItem value="spaventoso">Atmosfera inquietante</SelectItem>
                    <SelectItem value="romantico">Musica romantica</SelectItem>
                    <SelectItem value="surreale">Ambiente surreale</SelectItem>
                    <SelectItem value="tranquillo">Onde del mare</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{getAmbienceDescription()}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ambience-volume" className="flex items-center">
                  <Speaker className="h-4 w-4 mr-2" />
                  <span>Volume ambientale:</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="ambience-volume"
                    className="w-32"
                    value={[ambienceVolume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => changeAmbienceVolume(value[0])}
                  />
                  <span className="text-xs w-8 text-muted-foreground">{Math.round(ambienceVolume * 100)}%</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Personalizza l'esperienza di ascolto con diverse voci e ambienti sonori che si adattano all'emozione della tua storia.
        </p>
      </CardContent>
    </Card>
  );
}