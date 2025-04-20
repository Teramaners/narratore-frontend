import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, RefreshCw, Music } from "lucide-react";
import * as Tone from 'tone';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DreamSoundtrackProps {
  dreamContent: string;
  dreamStory: string;
  category: string;
  emotion: string;
  soundtrack?: string;
  soundMood?: string;
  onSoundtrackChange: (soundtrack: string, soundMood: string) => void;
}

export function DreamSoundtrack({
  dreamContent,
  dreamStory,
  category,
  emotion,
  soundtrack,
  soundMood,
  onSoundtrackChange
}: DreamSoundtrackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSoundMood, setCurrentSoundMood] = useState(soundMood || 'pacifico');
  const { toast } = useToast();
  
  // Opzioni di umore sonoro disponibili
  const soundMoods = [
    { value: 'allegro', label: 'Allegro' },
    { value: 'misterioso', label: 'Misterioso' },
    { value: 'inquietante', label: 'Inquietante' },
    { value: 'tranquillo', label: 'Tranquillo' },
    { value: 'epico', label: 'Epico' },
    { value: 'malinconico', label: 'Malinconico' },
    { value: 'sognante', label: 'Sognante' },
    { value: 'avventuroso', label: 'Avventuroso' },
    { value: 'romantico', label: 'Romantico' },
    { value: 'pacifico', label: 'Pacifico' },
  ];

  // Riferimenti per gli elementi sonori di Tone.js
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [reverb, setReverb] = useState<Tone.Reverb | null>(null);
  const [delay, setDelay] = useState<Tone.FeedbackDelay | null>(null);
  const [pattern, setPattern] = useState<Tone.Pattern<any> | null>(null);
  
  // Note musicali generate
  const [generatedNotes, setGeneratedNotes] = useState<string[]>([]);
  
  // Inizializza Tone.js al caricamento del componente
  useEffect(() => {
    // Crea gli elementi sonori solo se non esistono già
    if (!synth) {
      const newSynth = new Tone.PolySynth().toDestination();
      newSynth.volume.value = Tone.gainToDb(volume / 100); // Converti il volume in dB
      setSynth(newSynth);
      
      const newReverb = new Tone.Reverb({
        decay: 4,
        wet: 0.5,
      }).toDestination();
      
      const newDelay = new Tone.FeedbackDelay({
        delayTime: 0.25,
        feedback: 0.3,
        wet: 0.2,
      }).toDestination();
      
      // Collega gli effetti
      newSynth.connect(newReverb);
      newSynth.connect(newDelay);
      
      setReverb(newReverb);
      setDelay(newDelay);
    }
    
    // Cleanup quando il componente viene smontato
    return () => {
      if (pattern) {
        pattern.stop();
        pattern.dispose();
      }
      if (synth) {
        synth.dispose();
      }
      if (reverb) {
        reverb.dispose();
      }
      if (delay) {
        delay.dispose();
      }
    };
  }, []);
  
  // Effetto per gestire il volume
  useEffect(() => {
    if (synth) {
      synth.volume.value = Tone.gainToDb(volume / 100);
    }
  }, [volume, synth]);
  
  // Effetto per gestire il soundtrack
  useEffect(() => {
    if (soundtrack) {
      try {
        // Se esiste già un soundtrack, parsifica le note
        const notes = JSON.parse(soundtrack);
        setGeneratedNotes(notes);
      } catch (e) {
        console.error("Errore nel parsing delle note dal soundtrack:", e);
      }
    }
  }, [soundtrack]);
  
  // Genera una sequenza di note basata sull'umore
  const generateNotes = (mood: string): string[] => {
    let notes: string[] = [];
    let scale: string[] = [];
    
    // Seleziona la scala appropriata in base all'umore
    switch (mood) {
      case 'allegro':
        scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']; // Scala maggiore (allegra)
        break;
      case 'misterioso':
        scale = ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5']; // Scala dorica (misteriosa)
        break;
      case 'inquietante':
        scale = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5']; // Scala alterata (inquietante)
        break;
      case 'tranquillo':
        scale = ['G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5']; // Scala pentatonica maggiore (tranquilla)
        break;
      case 'epico':
        scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']; // Scala ionica estesa (epica)
        break;
      case 'malinconico':
        scale = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4']; // Scala minore naturale (malinconica)
        break;
      case 'sognante':
        scale = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5']; // Scala pentatonica minore (sognante)
        break;
      case 'avventuroso':
        scale = ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5']; // Scala lidia (avventurosa)
        break;
      case 'romantico':
        scale = ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']; // Scala minore melodica (romantica)
        break;
      default: // pacifico
        scale = ['G3', 'B3', 'D4', 'G4', 'B4', 'D5']; // Triade maggiore (pacifica)
    }
    
    // Genera una sequenza di ~16 note dalla scala selezionata
    const sequenceLength = 16;
    for (let i = 0; i < sequenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * scale.length);
      notes.push(scale[randomIndex]);
    }
    
    return notes;
  };
  
  // Riproduci le note con Tone.js
  const playNotes = () => {
    if (!synth || generatedNotes.length === 0) return;
    
    // Imposta il tempo in base all'umore
    let tempo = 120; // Tempo predefinito
    
    switch (currentSoundMood) {
      case 'allegro': tempo = 140; break;
      case 'misterioso': tempo = 90; break;
      case 'inquietante': tempo = 80; break;
      case 'tranquillo': tempo = 75; break;
      case 'epico': tempo = 110; break;
      case 'malinconico': tempo = 65; break;
      case 'sognante': tempo = 85; break;
      case 'avventuroso': tempo = 125; break;
      case 'romantico': tempo = 95; break;
      case 'pacifico': tempo = 70; break;
    }
    
    Tone.Transport.bpm.value = tempo;
    
    // Ferma il pattern esistente se è in esecuzione
    if (pattern) {
      pattern.stop();
      pattern.dispose();
    }
    
    // Crea un nuovo pattern di riproduzione
    const newPattern = new Tone.Pattern(
      (time, note) => {
        if (synth) {
          // Durata della nota in base all'umore
          let duration = '8n'; // Durata predefinita
          
          if (['tranquillo', 'malinconico', 'romantico', 'pacifico'].includes(currentSoundMood)) {
            duration = '4n'; // Note più lunghe per umori tranquilli
          } else if (['allegro', 'avventuroso'].includes(currentSoundMood)) {
            duration = '16n'; // Note più brevi per umori vivaci
          }
          
          // Suona la nota con la durata appropriata
          synth.triggerAttackRelease(note, duration, time);
        }
      },
      generatedNotes,
      "randomWalk" // tipo di pattern che crea una progressione più fluida
    );
    
    // Imposta il pattern e avvia la riproduzione
    setPattern(newPattern);
    newPattern.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };
  
  // Ferma la riproduzione
  const stopPlayback = () => {
    if (pattern) {
      pattern.stop();
    }
    Tone.Transport.stop();
    setIsPlaying(false);
  };
  
  // Alterna tra riproduzione e pausa
  const togglePlayback = async () => {
    // Se Tone.js non è stato avviato, avvialo (richiede interazione utente)
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    if (isPlaying) {
      stopPlayback();
    } else {
      playNotes();
    }
  };
  
  // Genera una nuova colonna sonora basata sul sogno e sull'umore
  const generateSoundtrack = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      if (dreamContent && currentSoundMood) {
        // Genera nuove note in base all'umore attuale
        const notes = generateNotes(currentSoundMood);
        setGeneratedNotes(notes);
        
        // Converti le note in JSON per il salvataggio
        const notesJson = JSON.stringify(notes);
        
        // Aggiorna il soundtrack nel componente genitore
        onSoundtrackChange(notesJson, currentSoundMood);
        
        toast({
          description: "Colonna sonora generata con successo!",
        });
      }
    } catch (error) {
      console.error("Errore nella generazione della colonna sonora:", error);
      toast({
        variant: 'destructive',
        description: "Errore durante la generazione della colonna sonora",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Effetto per aggiornare l'umore predefinito in base alla categoria e all'emozione del sogno
  useEffect(() => {
    // Se non è stato impostato un umore personalizzato, usa quelli predefiniti
    if (!soundMood) {
      let defaultMood = 'pacifico';
      
      // Seleziona l'umore in base alla categoria
      switch (category) {
        case 'spaventoso': defaultMood = 'inquietante'; break;
        case 'avventura': defaultMood = 'avventuroso'; break;
        case 'romantico': defaultMood = 'romantico'; break;
        case 'fantastico': defaultMood = 'epico'; break;
        case 'supereroi': defaultMood = 'epico'; break;
        case 'surreale': defaultMood = 'misterioso'; break;
        default: 
          // Se la categoria non offre un umore chiaro, basati sull'emozione
          switch (emotion) {
            case 'felice': defaultMood = 'allegro'; break;
            case 'triste': defaultMood = 'malinconico'; break;
            case 'spaventato': defaultMood = 'inquietante'; break;
            case 'ansioso': defaultMood = 'misterioso'; break;
            case 'nostalgico': defaultMood = 'sognante'; break;
            case 'eccitato': defaultMood = 'avventuroso'; break;
            case 'pacifico': defaultMood = 'tranquillo'; break;
            default: defaultMood = 'pacifico';
          }
      }
      
      setCurrentSoundMood(defaultMood);
    } else {
      setCurrentSoundMood(soundMood);
    }
  }, [category, emotion, soundMood]);
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Music className="h-5 w-5 mr-2" />
          Colonna sonora del sogno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="soundMood">Atmosfera musicale</Label>
            <Select
              value={currentSoundMood}
              onValueChange={(value) => setCurrentSoundMood(value)}
            >
              <SelectTrigger id="soundMood">
                <SelectValue placeholder="Seleziona un'atmosfera" />
              </SelectTrigger>
              <SelectContent>
                {soundMoods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="volume" className="flex justify-between items-center">
              <span>Volume</span>
              <span className="text-xs text-muted-foreground">{volume}%</span>
            </Label>
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="volume"
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={(vals) => setVolume(vals[0])}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 space-x-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={generateSoundtrack}
              disabled={isGenerating || !dreamContent}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Genera colonna sonora
                </>
              )}
            </Button>
            
            <Button
              className="w-full"
              onClick={togglePlayback}
              disabled={generatedNotes.length === 0}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausa
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Riproduci
                </>
              )}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            La colonna sonora viene generata in base all'atmosfera e alle emozioni del tuo sogno.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}