import { useState, useEffect } from 'react';
import { Moon, LogOut } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DreamInput } from '@/components/dream-input';
import { DreamList } from '@/components/dream-list';
import { StoryDisplay } from '@/components/story-display';
import { LoadingOverlay } from '@/components/loading-overlay';
import { ThemeToggle } from '@/components/theme-toggle';
import { SavedDream } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function Home() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sogno, setSogno] = useState("");
  const [racconto, setRacconto] = useState("");
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
    mutationFn: async (newDream: { testo: string, racconto: string }) => {
      const response = await apiRequest('POST', '/api/sogni', newDream);
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
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        description: 'Hai effettuato il logout con successo',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        description: `Errore durante il logout: ${err.message || 'Si è verificato un errore'}`,
      });
    }
  };

  const inviaSogno = async () => {
    if (!sogno.trim()) {
      setError("Per favore, racconta il tuo sogno prima di procedere.");
      return;
    }

    setGenerationLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/genera-racconto", { sogno });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setRacconto(data.story || data.racconto); // Supporta entrambi i formati di risposta

      // Salva il sogno e la storia nel database
      await saveDreamMutation.mutateAsync({
        testo: sogno,
        racconto: data.story || data.racconto
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
    setError("");
  };

  const caricaSogno = (sognoSalvato: any) => {
    setSogno(sognoSalvato.testo);
    setRacconto(sognoSalvato.racconto);
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
            
            <DreamList
              dreams={sogniSalvati}
              onDreamSelect={caricaSogno}
              onDreamDelete={eliminaSogno}
            />
          </div>
          
          {/* Output column */}
          <div className="w-full md:w-1/2">
            <StoryDisplay story={racconto} />
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
