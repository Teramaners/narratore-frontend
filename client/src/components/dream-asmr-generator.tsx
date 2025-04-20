import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import * as Tone from 'tone';

interface DreamASMRGeneratorProps {
  dreamContent: string;
  dreamStory: string;
  emotion: string;
}

export function DreamASMRGenerator({
  dreamContent,
  dreamStory,
  emotion,
}: DreamASMRGeneratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  
  // Riferimenti per i sintetizzatori e gli effetti Tone.js
  const ambienceSynth = useRef<any>(null);
  const melodySynth = useRef<any>(null);
  const padSynth = useRef<any>(null);
  const reverb = useRef<any>(null);
  const delay = useRef<any>(null);
  
  // Definizione del tipo per le proprietà audio
  interface AudioProperties {
    tempo: number;
    key: string;
    scale: string;
    reverb: number;
    delay: number;
    notes: number[];
  }

  // Funzione per tradurre emozioni in caratteristiche sonore
  const getAudioPropertiesFromEmotion = (emotion: string): AudioProperties => {
    const properties: AudioProperties = {
      tempo: 80,       // BPM
      key: 'C4',       // Nota di base
      scale: 'major',  // Scala (major, minor, etc.)
      reverb: 0.5,     // Quantità di riverbero
      delay: 0.2,      // Quantità di delay
      notes: []        // Note da riprodurre
    };
    
    // Personalizza le proprietà in base all'emozione
    switch(emotion) {
      case 'felice':
        properties.tempo = 95;
        properties.key = 'E4';
        properties.scale = 'major';
        properties.reverb = 0.3;
        properties.delay = 0.1;
        break;
      case 'triste':
        properties.tempo = 60;
        properties.key = 'A3';
        properties.scale = 'minor';
        properties.reverb = 0.8;
        properties.delay = 0.4;
        break;
      case 'spaventato':
        properties.tempo = 100;
        properties.key = 'D3';
        properties.scale = 'minor';
        properties.reverb = 0.7;
        properties.delay = 0.3;
        break;
      case 'arrabbiato':
        properties.tempo = 120;
        properties.key = 'G3';
        properties.scale = 'minor';
        properties.reverb = 0.4;
        properties.delay = 0.2;
        break;
      case 'sorpreso':
        properties.tempo = 90;
        properties.key = 'F4';
        properties.scale = 'major';
        properties.reverb = 0.6;
        properties.delay = 0.3;
        break;
      case 'sereno':
        properties.tempo = 70;
        properties.key = 'G4';
        properties.scale = 'major';
        properties.reverb = 0.7;
        properties.delay = 0.4;
        break;
      case 'confuso':
        properties.tempo = 85;
        properties.key = 'B3';
        properties.scale = 'minor';
        properties.reverb = 0.5;
        properties.delay = 0.3;
        break;
      default:  // neutro o altro
        properties.tempo = 80;
        properties.key = 'C4';
        properties.scale = 'major';
        properties.reverb = 0.5;
        properties.delay = 0.3;
    }
    
    // Genera sequenze di note basate sulle proprietà
    properties.notes = generateNotes(properties.key, properties.scale);
    
    return properties;
  };
  
  // Funzione per generare sequenze di note basate su tonalità e scala
  const generateNotes = (key: string, scale: string): number[] => {
    const majorScale = [0, 2, 4, 5, 7, 9, 11, 12];
    const minorScale = [0, 2, 3, 5, 7, 8, 10, 12];
    
    const baseNotes = scale === 'major' ? majorScale : minorScale;
    const baseNote = Tone.Frequency(key).toFrequency();
    
    const notes: number[] = [];
    for (let i = 0; i < 16; i++) {
      const scalePosition = Math.floor(Math.random() * baseNotes.length);
      const octaveShift = Math.floor(Math.random() * 2) - 1; // -1, 0, o 1
      
      const note = baseNote * Math.pow(2, (baseNotes[scalePosition] + (octaveShift * 12)) / 12);
      notes.push(note);
    }
    
    return notes;
  };
  
  // Inizializza gli strumenti e gli effetti Tone.js
  const setupAudio = () => {
    // Crea effetti
    reverb.current = new Tone.Reverb({
      decay: 5,
      wet: 0.5
    }).toDestination();
    
    delay.current = new Tone.FeedbackDelay({
      delayTime: 0.3,
      feedback: 0.4,
      wet: 0.3
    }).connect(reverb.current);
    
    // Crea sintetizzatori
    ambienceSynth.current = new Tone.PolySynth(Tone.Synth).connect(reverb.current);
    ambienceSynth.current.set({
      volume: -20,
      envelope: {
        attack: 1.5,
        decay: 0.5,
        sustain: 0.8,
        release: 5
      }
    });
    
    melodySynth.current = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 3
      }
    }).connect(delay.current);
    melodySynth.current.volume.value = -15;
    
    padSynth.current = new Tone.PolySynth(Tone.Synth).connect(reverb.current);
    padSynth.current.set({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 3,
        decay: 2,
        sustain: 0.8,
        release: 8
      },
      volume: -18
    });
    
    setAudioGenerated(true);
  };
  
  // Funzione per avviare la riproduzione audio
  const startAudio = () => {
    if (!audioGenerated) {
      setupAudio();
    }
    
    const audioProperties = getAudioPropertiesFromEmotion(emotion);
    
    // Imposta il tempo
    Tone.Transport.bpm.value = audioProperties.tempo;
    
    // Crea una sequenza che riproduce note casuali dal pad
    const padPattern = new Tone.Pattern((time, note) => {
      padSynth.current.triggerAttackRelease(note, "8n", time);
    }, audioProperties.notes).start(0);
    padPattern.interval = "4n";
    
    // Crea una sequenza per melodie casuali
    const melodyPattern = new Tone.Pattern((time, note) => {
      if (Math.random() > 0.6) { // Suona solo alcune note per creare una melodia più sparsa
        melodySynth.current.triggerAttackRelease(note, "8n", time);
      }
    }, audioProperties.notes).start("2n");
    melodyPattern.interval = "4n";
    
    // Ambience di sottofondo
    const ambienceLoop = new Tone.Loop(time => {
      const note = audioProperties.notes[Math.floor(Math.random() * audioProperties.notes.length)];
      ambienceSynth.current.triggerAttackRelease(note, "4n", time);
    }, "2n").start(0);
    
    // Aggiorna il riverbero e il delay in base all'emozione
    reverb.current.wet.value = audioProperties.reverb;
    delay.current.wet.value = audioProperties.delay;
    
    // Avvia la riproduzione
    Tone.Transport.start();
    setIsPlaying(true);
  };
  
  // Funzione per interrompere l'audio
  const stopAudio = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Cancella tutti i loop e le sequenze pianificate
    setIsPlaying(false);
  };
  
  // Gestisce il cambio del volume
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    // Converti da 0-1 a decibel (approssimativo)
    const dbValue = Tone.gainToDb(newVolume);
    
    // Imposta il volume master
    Tone.Destination.volume.value = dbValue;
  };
  
  // Gestisce il toggle del mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      Tone.Destination.mute = true;
    } else {
      Tone.Destination.mute = false;
    }
  };
  
  // Pulisci quando il componente viene smontato
  useEffect(() => {
    return () => {
      stopAudio();
      
      // Dispose di tutti i synth e gli effetti
      if (ambienceSynth.current) ambienceSynth.current.dispose();
      if (melodySynth.current) melodySynth.current.dispose();
      if (padSynth.current) padSynth.current.dispose();
      if (reverb.current) reverb.current.dispose();
      if (delay.current) delay.current.dispose();
    };
  }, []);
  
  return (
    <Card className="relative overflow-hidden dark:bg-gray-800/60 light:bg-white/80 border-2 dark:border-purple-900/50 light:border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Headphones className="h-5 w-5 mr-2 dark:text-green-400 light:text-indigo-600" />
          Paesaggio Sonoro del Sogno
        </CardTitle>
        <CardDescription>
          Genera una traccia audio rilassante ispirata al tuo sogno
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          <div className="flex items-center space-x-4 w-full justify-center">
            <Button
              variant={isPlaying ? "outline" : "default"}
              size="icon"
              onClick={isPlaying ? stopAudio : startAudio}
              className={isPlaying 
                ? "dark:bg-red-900/30 dark:hover:bg-red-800/50 light:bg-red-50 light:hover:bg-red-100"
                : "dark:bg-green-900/30 dark:hover:bg-green-800/50 light:bg-green-50 light:hover:bg-green-100"
              }
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="dark:bg-gray-800/30 dark:hover:bg-gray-700/50 light:bg-gray-50 light:hover:bg-gray-100"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-32 md:w-48">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
          
          <div className="text-center text-sm dark:text-gray-400 light:text-gray-500">
            Questo audio è generato in base all'emozione predominante del tuo sogno
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 text-xs dark:text-gray-500 light:text-gray-500 text-center">
        <div className="w-full">
          Utilizza cuffie o altoparlanti per la migliore esperienza
        </div>
      </CardFooter>
    </Card>
  );
}