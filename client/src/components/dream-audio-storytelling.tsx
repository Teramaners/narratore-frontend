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
  
  // Tipo personalizzato per i suoni ambientali
  type AmbientSound = {
    synth: any;
    loop?: any;
    cleanup: () => void;
  };
  
  const ambiencePlayerRef = useRef<AmbientSound | null>(null);
  const currentPositionRef = useRef<number>(0);
  const totalLengthRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  
  // Liste di effetti sonori ambientali per diverse emozioni (con URL locali che funzionano tramite sintesi tono.js)
  const ambienceSounds = {
    default: {
      url: 'default',
      description: 'Ambiente generico'
    },
    avventura: {
      url: 'adventure',
      description: 'Ambiente avventuroso'
    },
    spaventoso: {
      url: 'spooky',
      description: 'Atmosfera inquietante'
    },
    romantico: {
      url: 'romantic',
      description: 'Musica romantica'
    },
    surreale: {
      url: 'surreal',
      description: 'Ambiente surreale'
    },
    tranquillo: {
      url: 'calm',
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
  
  // Verifica la compatibilità del browser con la sintesi vocale e le voci disponibili all'avvio
  useEffect(() => {
    // Verifica se la sintesi vocale è supportata nel browser
    if (!window.speechSynthesis) {
      toast({
        variant: "destructive",
        description: "La sintesi vocale non è supportata in questo browser. Prova con Chrome, Edge o Safari.",
      });
      return;
    }

    const loadVoices = () => {
      try {
        const availableVoices = synth.getVoices();
        
        if (!availableVoices || availableVoices.length === 0) {
          console.warn("Nessuna voce disponibile per la sintesi vocale");
          setTimeout(loadVoices, 200); // Riprova tra 200ms se non ci sono voci
          return;
        }
        
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
        
        if (filteredVoices.length === 0) {
          // Se non ci sono voci in italiano o inglese, usa tutte le voci disponibili
          const allVoices = availableVoices.map(voice => ({
            id: voice.voiceURI,
            name: voice.name,
            lang: voice.lang,
            gender: (voice.name.toLowerCase().includes('female') || 
                    voice.name.toLowerCase().includes('donna')) ? 'female' as const : 'male' as const
          }));
          
          console.log("Nessuna voce italiana o inglese trovata, uso tutte le voci disponibili:", availableVoices);
          setVoices(allVoices);
          
          if (allVoices.length > 0) {
            setSelectedVoice(allVoices[0].id);
          }
        } else {
          setVoices(filteredVoices);
          
          // Seleziona automaticamente una voce italiana se disponibile
          const italianVoice = filteredVoices.find(voice => voice.lang.includes('it'));
          if (italianVoice) {
            setSelectedVoice(italianVoice.id);
          } else if (filteredVoices.length > 0) {
            setSelectedVoice(filteredVoices[0].id);
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento delle voci:", error);
        toast({
          variant: "destructive",
          description: "Errore nel caricamento delle voci. Ricarica la pagina o prova con un altro browser.",
        });
      }
    };
    
    // Carica le voci quando sono disponibili
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    // Chrome su alcune piattaforme potrebbe non attivare onvoiceschanged, quindi proviamo a caricare le voci direttamente
    loadVoices();
    
    // Imposta il tipo di ambiente basato sull'emozione
    setAmbienceType(getAmbienceForEmotion(emotion));
    
    // Cleanup al dismount
    return () => {
      stopPlayback();
      if (ambiencePlayerRef.current) {
        if (ambiencePlayerRef.current.cleanup) {
          ambiencePlayerRef.current.cleanup();
        }
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
      // Controlla se la sintesi vocale è supportata
      if (!window.speechSynthesis) {
        throw new Error("La sintesi vocale non è supportata in questo browser");
      }
      
      // Controlla se la sintesi vocale è disponibile e funzionante
      const availableVoices = synth.getVoices();
      if (!availableVoices || availableVoices.length === 0) {
        throw new Error("Nessuna voce disponibile per la sintesi vocale");
      }
      
      // Ferma eventuali riproduzioni in corso
      stopPlayback();
      
      // Otteniamo la selezione della voce corrente
      let selectedVoiceObj = availableVoices.find(voice => voice.voiceURI === selectedVoice);
      if (!selectedVoiceObj) {
        console.warn("Voce selezionata non trovata, uso la voce predefinita");
        if (availableVoices.length > 0) {
          selectedVoiceObj = availableVoices[0];
        }
      }
      
      // Per prevenire problemi con testi troppo lunghi, dividiamo il testo in frasi
      // e creiamo un utterance per ogni frase
      const sentences = dreamStory
        .replace(/([.!?])\s*/g, "$1|")
        .split("|")
        .filter(sentence => sentence.trim().length > 0);
      
      if (sentences.length === 0) {
        throw new Error("Nessuna frase valida trovata nel testo");
      }
      
      // Impostiamo un flag per tenere traccia del completamento
      let isFirstSentence = true;
      let totalSentences = sentences.length;
      let completedSentences = 0;
      
      // Funzione per pronunciare una frase alla volta
      const speakSentence = (index: number) => {
        if (index >= sentences.length) {
          // Tutte le frasi sono state pronunciate
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
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(sentences[index]);
        utteranceRef.current = utterance;
        
        // Imposta i parametri della voce
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // Event handlers
        utterance.onstart = () => {
          setIsPlaying(true);
          
          // Avvia l'ambience se attivato e se è la prima frase
          if (enableAmbience && isFirstSentence) {
            playAmbience();
            isFirstSentence = false;
          }
          
          // Imposta la lunghezza totale per il tracking del progresso
          if (totalLengthRef.current === 0) {
            totalLengthRef.current = dreamStory.length;
          }
          
          // Avvia il monitoraggio del progresso se è la prima frase
          if (isFirstSentence && !intervalRef.current) {
            intervalRef.current = window.setInterval(() => {
              // Calcola il progresso basato sul numero di frasi completate
              const percentage = Math.min(100, Math.round((completedSentences / totalSentences) * 100));
              setProgress(percentage);
            }, 100);
          }
        };
        
        utterance.onpause = () => setIsPlaying(false);
        utterance.onresume = () => setIsPlaying(true);
        
        utterance.onend = () => {
          // Segna questa frase come completata
          completedSentences++;
          
          // Passa alla prossima frase
          speakSentence(index + 1);
        };
        
        utterance.onerror = (event) => {
          console.error('Errore nella sintesi vocale per la frase:', sentences[index], event);
          
          // Tenta di andare avanti alla prossima frase invece di fermarsi completamente
          completedSentences++;
          console.log(`Tentativo di proseguire con la prossima frase (${index + 1}/${sentences.length})...`);
          speakSentence(index + 1);
        };
        
        // Avvia la sintesi vocale per questa frase
        synth.speak(utterance);
      };
      
      // Inizia la riproduzione dalla prima frase
      speakSentence(0);
      
    } catch (err) {
      const error = err as Error;
      console.error('Errore nell\'avvio della riproduzione:', error);
      
      // Fallback: avvia solo l'audio ambientale se la sintesi vocale fallisce
      if (enableAmbience) {
        setIsPlaying(true);
        playAmbience();
        
        toast({
          variant: "destructive",
          description: "La sintesi vocale non è disponibile. Riproduco solo l'audio ambientale.",
        });
      } else {
        toast({
          variant: "destructive",
          description: "Errore nell'avvio della narrazione: " + (error.message || "Problemi con la sintesi vocale"),
        });
      }
    }
  };
  
  // Funzione per mettere in pausa/riprendere la riproduzione
  const togglePlayback = () => {
    try {
      if (synth.speaking) {
        if (synth.paused) {
          synth.resume();
          // Ripristina il volume dell'ambience se presente
          if (ambiencePlayerRef.current && ambiencePlayerRef.current.synth && ambiencePlayerRef.current.synth.volume) {
            try {
              ambiencePlayerRef.current.synth.volume.rampTo(ambienceVolume * -10, 0.5);
            } catch (error) {
              console.error("Errore nel ripristino del volume ambientale:", error);
            }
          }
        } else {
          synth.pause();
          // Abbassa il volume dell'ambience ma non fermarlo
          if (ambiencePlayerRef.current && ambiencePlayerRef.current.synth && ambiencePlayerRef.current.synth.volume) {
            try {
              ambiencePlayerRef.current.synth.volume.rampTo(-Infinity, 0.5);
            } catch (error) {
              console.error("Errore nell'abbassamento del volume ambientale:", error);
            }
          }
        }
      } else {
        startPlayback();
      }
    } catch (error) {
      console.error("Errore nel controllo della riproduzione:", error);
      // Se c'è un errore, proviamo a riavviare la riproduzione
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
  
  // Funzione per avviare l'audio ambientale usando suoni generati con Tone.js
  const playAmbience = async () => {
    try {
      if (ambiencePlayerRef.current) {
        if (ambiencePlayerRef.current.cleanup) {
          ambiencePlayerRef.current.cleanup();
        }
      }
      
      // Invece di caricare un file, generiamo l'ambiente sonoro in base al tipo
      const soundType = ambienceSounds[ambienceType as keyof typeof ambienceSounds]?.url || 'default';
      
      // Crea un synth diverso in base al tipo di ambiente
      let ambientSound;
      
      switch (soundType) {
        case 'default':
          // Suono ambientale generico con note casuali e riverbero
          const synth = new Tone.PolySynth().toDestination();
          const reverb = new Tone.Reverb(5).toDestination();
          synth.connect(reverb);
          
          // Imposta volume iniziale a zero per fade in
          synth.volume.value = -Infinity;
          
          // Crea un loop che suona note casuali
          const loop = new Tone.Loop(time => {
            synth.triggerAttackRelease(
              ["C4", "E4", "G4", "B4"][Math.floor(Math.random() * 4)],
              "8n",
              time,
              0.1
            );
          }, "4n");
          
          // Avvia il loop
          loop.start(0);
          
          // Fade in
          synth.volume.rampTo(ambienceVolume * -10, 2);
          
          ambientSound = { synth, loop, cleanup: () => {
            loop.stop();
            synth.dispose();
            reverb.dispose();
          }};
          break;
          
        case 'adventure':
          // Suono avventuroso con ritmo più veloce e note più dinamiche
          const adventureSynth = new Tone.PolySynth().toDestination();
          const adventureReverb = new Tone.Reverb(3).toDestination();
          adventureSynth.connect(adventureReverb);
          
          // Imposta volume iniziale a zero per fade in
          adventureSynth.volume.value = -Infinity;
          
          // Crea un pattern ritmico più energico
          const adventureLoop = new Tone.Sequence((time, note) => {
            adventureSynth.triggerAttackRelease(note, "16n", time, 0.2);
          }, ["G3", "D4", "G4", "A4", "B4", "D5", "G4", "A4"], "8n");
          
          // Avvia il pattern
          adventureLoop.start(0);
          
          // Fade in
          adventureSynth.volume.rampTo(ambienceVolume * -8, 2);
          
          ambientSound = { synth: adventureSynth, loop: adventureLoop, cleanup: () => {
            adventureLoop.stop();
            adventureSynth.dispose();
            adventureReverb.dispose();
          }};
          break;
          
        case 'spooky':
          // Suono inquietante con dissonanze e basse frequenze
          const spookySynth = new Tone.PolySynth().toDestination();
          const spookyReverb = new Tone.Reverb(6).toDestination();
          const spookyDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
          spookySynth.connect(spookyReverb);
          spookySynth.connect(spookyDelay);
          
          // Imposta volume iniziale a zero per fade in
          spookySynth.volume.value = -Infinity;
          
          // Crea un pattern inquietante
          const spookyLoop = new Tone.Loop(time => {
            const note = ["C2", "Eb2", "Gb2", "A2", "B2"][Math.floor(Math.random() * 5)];
            spookySynth.triggerAttackRelease(note, "2n", time, 0.1);
          }, "2n");
          
          // Avvia il pattern
          spookyLoop.start(0);
          
          // Fade in
          spookySynth.volume.rampTo(ambienceVolume * -12, 3);
          
          ambientSound = { synth: spookySynth, loop: spookyLoop, cleanup: () => {
            spookyLoop.stop();
            spookySynth.dispose();
            spookyReverb.dispose();
            spookyDelay.dispose();
          }};
          break;
          
        case 'romantic':
          // Suono romantico con accordi dolci e armonizzati
          const romanticSynth = new Tone.PolySynth().toDestination();
          const romanticReverb = new Tone.Reverb(4).toDestination();
          romanticSynth.connect(romanticReverb);
          
          // Imposta volume iniziale a zero per fade in
          romanticSynth.volume.value = -Infinity;
          
          // Sequenza di accordi romantici
          const chords = [
            ["E3", "G3", "B3", "E4"],
            ["A3", "C4", "E4", "A4"],
            ["D3", "F#3", "A3", "D4"],
            ["G3", "B3", "D4", "G4"],
          ];
          
          const romanticLoop = new Tone.Sequence((time, chord) => {
            romanticSynth.triggerAttackRelease(chord, "2n", time, 0.1);
          }, chords, "2n");
          
          // Avvia la sequenza
          romanticLoop.start(0);
          
          // Fade in
          romanticSynth.volume.rampTo(ambienceVolume * -8, 2);
          
          ambientSound = { synth: romanticSynth, loop: romanticLoop, cleanup: () => {
            romanticLoop.stop();
            romanticSynth.dispose();
            romanticReverb.dispose();
          }};
          break;
          
        case 'surreal':
          // Suono surreale con effetti strani e note dissonanti
          const surrealSynth = new Tone.PolySynth().toDestination();
          const surrealReverb = new Tone.Reverb(8).toDestination();
          const surrealDelay = new Tone.PingPongDelay("16n", 0.8).toDestination();
          const surrealFilter = new Tone.AutoFilter(0.1).start().toDestination();
          
          surrealSynth.connect(surrealReverb);
          surrealSynth.connect(surrealDelay);
          surrealSynth.connect(surrealFilter);
          
          // Imposta volume iniziale a zero per fade in
          surrealSynth.volume.value = -Infinity;
          
          // Note strane e tempi irregolari
          const surrealLoop = new Tone.Loop(time => {
            const offset = Math.random() * 0.5;
            const note = ["D#4", "G#3", "A#5", "C2", "F#6"][Math.floor(Math.random() * 5)];
            surrealSynth.triggerAttackRelease(note, "4n", time + offset, 0.1);
          }, "3n");
          
          // Avvia il loop
          surrealLoop.start(0);
          
          // Fade in
          surrealSynth.volume.rampTo(ambienceVolume * -15, 4);
          
          ambientSound = { synth: surrealSynth, loop: surrealLoop, cleanup: () => {
            surrealLoop.stop();
            surrealSynth.dispose();
            surrealReverb.dispose();
            surrealDelay.dispose();
            surrealFilter.dispose();
          }};
          break;
          
        case 'calm':
          // Suono calmo con onde oceaniche
          const calmSynth = new Tone.Noise("pink").start();
          const calmFilter = new Tone.Filter({
            type: "lowpass",
            frequency: 500,
            Q: 1
          }).toDestination();
          
          const calmLFO = new Tone.LFO({
            frequency: 0.1,
            min: 300,
            max: 800
          }).connect(calmFilter.frequency);
          
          calmSynth.connect(calmFilter);
          calmLFO.start();
          
          // Imposta volume iniziale a zero per fade in
          calmSynth.volume.value = -Infinity;
          
          // Fade in
          calmSynth.volume.rampTo(ambienceVolume * -25, 3);
          
          ambientSound = { synth: calmSynth, cleanup: () => {
            calmSynth.stop();
            calmSynth.dispose();
            calmFilter.dispose();
            calmLFO.dispose();
          }};
          break;
          
        default:
          // Fallback a default
          const defaultSynth = new Tone.PolySynth().toDestination();
          const defaultReverb = new Tone.Reverb(3).toDestination();
          defaultSynth.connect(defaultReverb);
          
          // Imposta volume iniziale a zero per fade in
          defaultSynth.volume.value = -Infinity;
          
          // Crea un loop semplice
          const defaultLoop = new Tone.Loop(time => {
            defaultSynth.triggerAttackRelease("C4", "8n", time);
          }, "4n");
          
          // Avvia il loop
          defaultLoop.start(0);
          
          // Fade in
          defaultSynth.volume.rampTo(ambienceVolume * -12, 2);
          
          ambientSound = { synth: defaultSynth, loop: defaultLoop, cleanup: () => {
            defaultLoop.stop();
            defaultSynth.dispose();
            defaultReverb.dispose();
          }};
      }
      
      // Memorizza l'ambiente sonoro per poterlo fermare in seguito
      ambiencePlayerRef.current = ambientSound;
      
    } catch (error) {
      console.error('Errore nell\'avvio dell\'audio ambientale:', error);
    }
  };
  
  // Funzione per fermare l'audio ambientale
  const stopAmbience = (withFade = false) => {
    if (ambiencePlayerRef.current) {
      if (withFade) {
        // Fade out graduale
        if (ambiencePlayerRef.current.synth && ambiencePlayerRef.current.synth.volume) {
          ambiencePlayerRef.current.synth.volume.rampTo(-Infinity, 2);
          
          // Pulizia dopo il fade out
          setTimeout(() => {
            if (ambiencePlayerRef.current && ambiencePlayerRef.current.cleanup) {
              ambiencePlayerRef.current.cleanup();
              ambiencePlayerRef.current = null;
            }
          }, 2000);
        } else {
          // Fallback per altri tipi di oggetti Tone.js
          if (ambiencePlayerRef.current.cleanup) {
            ambiencePlayerRef.current.cleanup();
            ambiencePlayerRef.current = null;
          }
        }
      } else {
        // Stop immediato
        if (ambiencePlayerRef.current.cleanup) {
          ambiencePlayerRef.current.cleanup();
          ambiencePlayerRef.current = null;
        }
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
    if (ambiencePlayerRef.current && ambiencePlayerRef.current.synth && ambiencePlayerRef.current.synth.volume) {
      try {
        // Applica un fattore di scala per mantenere il volume in un intervallo ragionevole
        // Valori più bassi (più negativi) sono più silenziosi in Tone.js
        const scaledVolume = value * -20; // Scale da 0-1 a 0 a -20
        ambiencePlayerRef.current.synth.volume.rampTo(scaledVolume, 0.1);
      } catch (error) {
        console.error("Errore nella regolazione del volume:", error);
      }
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