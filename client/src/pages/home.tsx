import { useState, useEffect } from 'react';
import { Moon, LogOut, List, Clock, Trophy } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DreamInput } from '@/components/dream-input';
import { DreamList } from '@/components/dream-list';
import { StoryDisplay } from '@/components/story-display';
import { DreamCategory } from '@/components/dream-category';
import { DreamSoundtrack } from '@/components/dream-soundtrack';
import { DreamShareEnhanced } from '@/components/dream-share-enhanced';
import { DreamPdfExporter } from '@/components/dream-pdf-exporter';
import { DreamTimeline } from '@/components/dream-timeline';
import { DreamEmojiTranslator } from '@/components/dream-emoji-translator';
import { DreamImageGenerator } from '@/components/dream-image-generator';
import { DreamASMRGenerator } from '@/components/dream-asmr-generator';
import { DreamEmotionAnalysis } from '@/components/dream-emotion-analysis';
import { DreamSymbolDictionary } from '@/components/dream-symbol-dictionary';
import { DreamStoryGenerator } from '@/components/dream-story-generator';
import { LoadingOverlay } from '@/components/loading-overlay';
import { ThemeToggle } from '@/components/theme-toggle';
import { SavedDream } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function Home() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [sogno, setSogno] = useState("");
  const [racconto, setRacconto] = useState("");
  const [categoria, setCategoria] = useState("non_categorizzato");
  const [emozione, setEmozione] = useState("neutro");
  const [preferito, setPreferito] = useState(false);
  const [soundtrack, setSoundtrack] = useState<string>("");
  const [soundMood, setSoundMood] = useState<string>("");
  const [emojiTranslation, setEmojiTranslation] = useState<string>("");
  const [dreamImageUrl, setDreamImageUrl] = useState<string>("");
  const [generationLoading, setGenerationLoading] = useState(false);
  const [error, setError] = useState("");

  // Query per caricare i sogni dell'utente dal database
  const { 
    data: sogniSalvati = [], 
    isLoading: isLoadingSogni,
    refetch: refetchSogni
  } = useQuery({
    queryKey: ['/api/sogni'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sogni');
      return response.json();
    },
    enabled: !!user
  });

  // Mutation per salvare un nuovo sogno
  const saveDreamMutation = useMutation({
    mutationFn: async (newDream: { 
      testo: string, 
      racconto: string,
      categoria?: string,
      emozione?: string,
      preferito?: boolean,
      soundtrack?: string,
      soundMood?: string,
      emojiTranslation?: string,
      dreamImageUrl?: string,
      id?: number // Per gli aggiornamenti
    }) => {
      // Se c'è un ID, aggiorna un sogno esistente
      if (newDream.id) {
        const response = await apiRequest('PUT', `/api/sogni/${newDream.id}`, {
          category: newDream.categoria || 'non_categorizzato',
          emotion: newDream.emozione || 'neutro',
          isFavorite: newDream.preferito ? 1 : 0,   // Converti booleano in intero (0/1)
          soundtrack: newDream.soundtrack,
          soundMood: newDream.soundMood,
          emojiTranslation: newDream.emojiTranslation,
          dreamImageUrl: newDream.dreamImageUrl
        });
        return response.json();
      }
      
      // Altrimenti crea un nuovo sogno
      // Converti i nomi dei campi da italiano a inglese per il database
      const response = await apiRequest('POST', '/api/sogni', {
        content: newDream.testo,           // 'content' nel database invece di 'testo'
        story: newDream.racconto,          // 'story' nel database invece di 'racconto'
        category: newDream.categoria || 'non_categorizzato',
        emotion: newDream.emozione || 'neutro',
        isFavorite: newDream.preferito ? 1 : 0,   // Converti booleano in intero (0/1)
        soundtrack: newDream.soundtrack,
        soundMood: newDream.soundMood,
        emojiTranslation: newDream.emojiTranslation,
        dreamImageUrl: newDream.dreamImageUrl
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sogni'] });
      toast({
        description: 'Sogno salvato con successo',
      });
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        description: `Errore nel salvataggio: ${err.message || 'Si è verificato un errore'}`,
      });
    }
  });

  // Mutation per eliminare un sogno
  const deleteDreamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/sogni/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sogni'] });
      toast({
        description: 'Sogno eliminato con successo',
      });
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        description: `Errore nell'eliminazione: ${err.message || 'Si è verificato un errore'}`,
      });
    }
  });

  // Gestisce il logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const inviaSogno = async () => {
    if (!sogno.trim()) {
      setError("Per favore, racconta il tuo sogno prima di procedere.");
      return;
    }

    setGenerationLoading(true);
    setError("");

    try {
      // Richiesta per generare il racconto
      const responseStory = await apiRequest("POST", "/api/genera-racconto", { sogno });
      const dataStory = await responseStory.json();

      if (dataStory.error) {
        throw new Error(dataStory.error);
      }

      const storiaGenerata = dataStory.story || dataStory.racconto;
      setRacconto(storiaGenerata); // Supporta entrambi i formati di risposta

      // Richiesta per generare le emoji (non blocchiamo il flusso principale se fallisce)
      let emojiGenerata = "";
      try {
        const responseEmoji = await apiRequest("POST", "/api/genera-emoji", { sogno });
        const dataEmoji = await responseEmoji.json();
        
        if (!dataEmoji.error && dataEmoji.emojiTranslation) {
          emojiGenerata = dataEmoji.emojiTranslation;
          setEmojiTranslation(emojiGenerata);
        }
      } catch (emojiError) {
        console.error("Errore nella generazione delle emoji:", emojiError);
        // Non blocchiamo il flusso principale se la generazione delle emoji fallisce
      }

      // Salva il sogno, la storia e le emoji nel database
      await saveDreamMutation.mutateAsync({
        testo: sogno,
        racconto: storiaGenerata,
        categoria: categoria,
        emozione: emozione,
        preferito: preferito,
        emojiTranslation: emojiGenerata
      });
      
      // Ricarica la lista dei sogni
      refetchSogni();
    } catch (err: any) {
      setError(`Errore: ${err.message || "Problema nella generazione del racconto. Riprova più tardi."}`);
      console.error(err);
    } finally {
      setGenerationLoading(false);
    }
  };

  const resetForm = () => {
    setSogno("");
    setRacconto("");
    setCategoria("non_categorizzato");
    setEmozione("neutro");
    setPreferito(false);
    setSoundtrack("");
    setSoundMood("");
    setEmojiTranslation("");
    setDreamImageUrl("");
    setError("");
  };

  // Funzione adattatore per caricare i sogni dal database o dall'interfaccia
  const caricaSogno = (sognoSalvato: any) => {
    console.log("Caricamento sogno:", sognoSalvato);
    // Se viene dai componenti UI, usa testo e racconto
    if (sognoSalvato.testo) {
      setSogno(sognoSalvato.testo);
      setRacconto(sognoSalvato.racconto);
      if (sognoSalvato.categoria) setCategoria(sognoSalvato.categoria);
      if (sognoSalvato.emozione) setEmozione(sognoSalvato.emozione);
      if (sognoSalvato.preferito !== undefined) setPreferito(sognoSalvato.preferito);
      if (sognoSalvato.soundtrack) setSoundtrack(sognoSalvato.soundtrack);
      if (sognoSalvato.soundMood) setSoundMood(sognoSalvato.soundMood);
      if (sognoSalvato.emojiTranslation) setEmojiTranslation(sognoSalvato.emojiTranslation);
      if (sognoSalvato.dreamImageUrl) setDreamImageUrl(sognoSalvato.dreamImageUrl);
    } 
    // Se viene dal database, mappa content a testo e story a racconto
    else if (sognoSalvato.content) {
      setSogno(sognoSalvato.content);
      setRacconto(sognoSalvato.story);
      if (sognoSalvato.category) setCategoria(sognoSalvato.category);
      if (sognoSalvato.emotion) setEmozione(sognoSalvato.emotion);
      if (sognoSalvato.isFavorite !== undefined) {
        // Il database potrebbe usare 0/1 per il booleano
        const isPreferito = typeof sognoSalvato.isFavorite === 'number' 
          ? sognoSalvato.isFavorite > 0
          : sognoSalvato.isFavorite;
        setPreferito(isPreferito);
      }
      if (sognoSalvato.soundtrack) setSoundtrack(sognoSalvato.soundtrack);
      if (sognoSalvato.soundMood) setSoundMood(sognoSalvato.soundMood);
      if (sognoSalvato.emojiTranslation) setEmojiTranslation(sognoSalvato.emojiTranslation);
      if (sognoSalvato.dreamImageUrl) setDreamImageUrl(sognoSalvato.dreamImageUrl);
    }
  };

  const eliminaSogno = (id: number) => {
    deleteDreamMutation.mutate(id);
  };
  
  // Determina se mostrare il loading overlay
  const isLoading = generationLoading || saveDreamMutation.isPending || deleteDreamMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 dark:from-indigo-900 dark:to-purple-900 light:from-blue-100 light:to-purple-100 p-4 md:p-6 transition-colors duration-500">
      <LoadingOverlay isVisible={isLoading} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center">
            <Moon className="h-6 w-6 md:h-8 md:w-8 mr-2 dark:text-yellow-200 light:text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white light:text-gray-800">Narratore di Sogni</h1>
            <span className="hidden sm:inline-block ml-2 px-2 py-1 rounded text-xs dark:bg-purple-700 dark:text-purple-200 light:bg-indigo-100 light:text-indigo-600">
              Powered by Gemini
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center mr-2">
                <span className="text-sm dark:text-purple-200 light:text-indigo-700">
                  Ciao, {user.username}
                </span>
                <Button
                  variant="ghost"
                  className="ml-2 dark:text-purple-200 light:text-indigo-700"
                  onClick={() => window.location.href = "/sfide"}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sfide</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Input column */}
          <div className="w-full md:w-1/2">
            <DreamInput
              onSubmit={inviaSogno}
              onReset={resetForm}
              loading={isLoading}
              error={error}
              currentDream={sogno}
              setCurrentDream={setSogno}
            />
            
            {/* Generatore di storie AI avanzato */}
            {sogno.trim().length > 0 && (
              <div className="mt-4">
                <DreamStoryGenerator
                  dreamContent={sogno}
                  onStoryGenerated={(story, title) => {
                    setRacconto(story);
                    
                    // Gestisce la generazione delle emoji dopo la storia (stesso comportamento di inviaSogno)
                    const generateEmojis = async () => {
                      try {
                        const responseEmoji = await apiRequest("POST", "/api/genera-emoji", { sogno });
                        const dataEmoji = await responseEmoji.json();
                        
                        if (!dataEmoji.error && dataEmoji.emojiTranslation) {
                          const emojiGenerata = dataEmoji.emojiTranslation;
                          setEmojiTranslation(emojiGenerata);
                          
                          // Salva il sogno con tutti i dati
                          await saveDreamMutation.mutateAsync({
                            testo: sogno,
                            racconto: story,
                            categoria: categoria,
                            emozione: emozione,
                            preferito: preferito,
                            emojiTranslation: emojiGenerata
                          });
                        }
                      } catch (emojiError) {
                        console.error("Errore nella generazione delle emoji:", emojiError);
                        // Salva comunque il sogno anche senza emoji
                        await saveDreamMutation.mutateAsync({
                          testo: sogno,
                          racconto: story,
                          categoria: categoria,
                          emozione: emozione,
                          preferito: preferito
                        });
                      }
                      
                      // Ricarica la lista dei sogni
                      refetchSogni();
                    };
                    
                    generateEmojis();
                  }}
                />
              </div>
            )}
            
            <Tabs defaultValue="list" className="mt-4">
              <TabsList className="w-full mb-2 dark:bg-gray-800/70 light:bg-gray-100">
                <TabsTrigger value="list" className="flex-1 dark:data-[state=active]:bg-gray-700 light:data-[state=active]:bg-white">
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1 dark:data-[state=active]:bg-gray-700 light:data-[state=active]:bg-white">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-0">
                <DreamList
                  dreams={sogniSalvati}
                  onDreamSelect={caricaSogno}
                  onDreamDelete={eliminaSogno}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <DreamTimeline 
                  dreams={sogniSalvati}
                  onSelectDream={caricaSogno}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Output column */}
          <div className="w-full md:w-1/2">
            <StoryDisplay story={racconto} />
            
            {racconto && (
              <>
                <DreamCategory
                  category={categoria}
                  emotion={emozione}
                  isFavorite={preferito}
                  onCategoryChange={(cat) => {
                    setCategoria(cat);
                    // Trova il sogno corrente dal database e aggiornalo se esiste
                    const currentDream = sogniSalvati.find((d: any) => 
                      (d.content === sogno && d.story === racconto) || 
                      (d.testo === sogno && d.racconto === racconto)
                    );
                    if (currentDream && currentDream.id) {
                      saveDreamMutation.mutate({
                        id: currentDream.id,
                        testo: sogno,
                        racconto: racconto,
                        categoria: cat,
                        emozione: emozione,
                        preferito: preferito,
                        soundtrack: soundtrack,
                        soundMood: soundMood
                      });
                    }
                  }}
                  onEmotionChange={(emoz) => {
                    setEmozione(emoz);
                    // Trova il sogno corrente dal database e aggiornalo se esiste
                    const currentDream = sogniSalvati.find((d: any) => 
                      (d.content === sogno && d.story === racconto) || 
                      (d.testo === sogno && d.racconto === racconto)
                    );
                    if (currentDream && currentDream.id) {
                      saveDreamMutation.mutate({
                        id: currentDream.id,
                        testo: sogno,
                        racconto: racconto,
                        categoria: categoria,
                        emozione: emoz,
                        preferito: preferito,
                        soundtrack: soundtrack,
                        soundMood: soundMood
                      });
                    }
                  }}
                  onFavoriteChange={(fav) => {
                    setPreferito(fav);
                    // Trova il sogno corrente dal database e aggiornalo se esiste
                    const currentDream = sogniSalvati.find((d: any) => 
                      (d.content === sogno && d.story === racconto) || 
                      (d.testo === sogno && d.racconto === racconto)
                    );
                    if (currentDream && currentDream.id) {
                      saveDreamMutation.mutate({
                        id: currentDream.id,
                        testo: sogno,
                        racconto: racconto,
                        categoria: categoria,
                        emozione: emozione,
                        preferito: fav,
                        soundtrack: soundtrack,
                        soundMood: soundMood
                      });
                    }
                  }}
                />
                
                <div className="mt-4">
                  <DreamSoundtrack 
                    dreamContent={sogno}
                    dreamStory={racconto}
                    category={categoria}
                    emotion={emozione}
                    soundtrack={soundtrack}
                    soundMood={soundMood}
                    onSoundtrackChange={(newSoundtrack, newSoundMood) => {
                      setSoundtrack(newSoundtrack);
                      setSoundMood(newSoundMood);
                      
                      // Trova il sogno corrente dal database e aggiornalo se esiste
                      const currentDream = sogniSalvati.find((d: any) => 
                        (d.content === sogno && d.story === racconto) || 
                        (d.testo === sogno && d.racconto === racconto)
                      );
                      if (currentDream && currentDream.id) {
                        saveDreamMutation.mutate({
                          id: currentDream.id,
                          testo: sogno,
                          racconto: racconto,
                          categoria: categoria,
                          emozione: emozione,
                          preferito: preferito,
                          soundtrack: newSoundtrack,
                          soundMood: newSoundMood
                        });
                      }
                    }}
                  />

                  <div className="mt-4">
                    <DreamEmojiTranslator 
                      dreamContent={sogno}
                      emojiTranslation={emojiTranslation}
                      onEmojiTranslationChange={(newEmojiTranslation) => {
                        setEmojiTranslation(newEmojiTranslation);
                        
                        // Trova il sogno corrente dal database e aggiornalo se esiste
                        const currentDream = sogniSalvati.find((d: any) => 
                          (d.content === sogno && d.story === racconto) || 
                          (d.testo === sogno && d.racconto === racconto)
                        );
                        if (currentDream && currentDream.id) {
                          saveDreamMutation.mutate({
                            id: currentDream.id,
                            testo: sogno,
                            racconto: racconto,
                            categoria: categoria,
                            emozione: emozione,
                            preferito: preferito,
                            soundtrack: soundtrack,
                            soundMood: soundMood,
                            emojiTranslation: newEmojiTranslation
                          });
                        }
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <DreamImageGenerator
                      dreamContent={sogno}
                      dreamStory={racconto}
                      dreamImageUrl={dreamImageUrl}
                      onImageUrlChange={(newImageUrl) => {
                        setDreamImageUrl(newImageUrl);
                        
                        // Trova il sogno corrente dal database e aggiornalo se esiste
                        const currentDream = sogniSalvati.find((d: any) => 
                          (d.content === sogno && d.story === racconto) || 
                          (d.testo === sogno && d.racconto === racconto)
                        );
                        if (currentDream && currentDream.id) {
                          saveDreamMutation.mutate({
                            id: currentDream.id,
                            testo: sogno,
                            racconto: racconto,
                            categoria: categoria,
                            emozione: emozione,
                            preferito: preferito,
                            soundtrack: soundtrack,
                            soundMood: soundMood,
                            emojiTranslation: emojiTranslation,
                            dreamImageUrl: newImageUrl
                          });
                        }
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <DreamASMRGenerator
                      dreamContent={sogno}
                      dreamStory={racconto}
                      emotion={emozione}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <DreamEmotionAnalysis
                      dreamContent={sogno}
                      dreamStory={racconto}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <DreamSymbolDictionary
                      dreamContent={sogno}
                    />
                  </div>
                  
                  <DreamShareEnhanced
                    dreamContent={sogno}
                    dreamStory={racconto}
                    category={categoria}
                    emotion={emozione}
                    dreamImageUrl={dreamImageUrl}
                  />
                  
                  <DreamPdfExporter
                    currentDream={{
                      id: sogniSalvati.find(
                        (d: any) => (d.content === sogno && d.story === racconto) || 
                                    (d.testo === sogno && d.racconto === racconto)
                      )?.id || 0,
                      content: sogno,
                      story: racconto,
                      category: categoria,
                      emotion: emozione,
                      isFavorite: preferito,
                      dreamImageUrl: dreamImageUrl,
                      emojiTranslation: emojiTranslation
                    }}
                    allDreams={sogniSalvati}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm dark:text-purple-300 light:text-indigo-500">
          <p>Narratore di Sogni © 2025 - Powered by Gemini AI</p>
          <p className="mt-1">Trasforma i tuoi sogni in storie uniche con l'intelligenza artificiale</p>
        </div>
      </div>
    </div>
  );
}
