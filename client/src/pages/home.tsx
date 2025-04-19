import { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { DreamInput } from '@/components/dream-input';
import { DreamList } from '@/components/dream-list';
import { StoryDisplay } from '@/components/story-display';
import { LoadingOverlay } from '@/components/loading-overlay';
import { ThemeToggle } from '@/components/theme-toggle';
import { getSavedDreams, saveDream, removeDream, SavedDream } from '@/lib/localStorage';

export default function Home() {
  const [sogno, setSogno] = useState("");
  const [racconto, setRacconto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sogniSalvati, setSogniSalvati] = useState<SavedDream[]>([]);

  // Load saved dreams on mount
  useEffect(() => {
    setSogniSalvati(getSavedDreams());
  }, []);

  const inviaSogno = async () => {
    if (!sogno.trim()) {
      setError("Per favore, racconta il tuo sogno prima di procedere.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/genera-racconto", { sogno });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setRacconto(data.racconto);

      // Save the dream and its story
      const nuovoSogno: SavedDream = {
        id: Date.now(),
        testo: sogno,
        racconto: data.racconto,
        data: new Date().toLocaleString()
      };

      setSogniSalvati(saveDream(nuovoSogno));
    } catch (err: any) {
      setError(`Errore: ${err.message || "Problema nella generazione del racconto. Riprova più tardi."}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSogno("");
    setRacconto("");
    setError("");
  };

  const caricaSogno = (sognoSalvato: SavedDream) => {
    setSogno(sognoSalvato.testo);
    setRacconto(sognoSalvato.racconto);
  };

  const eliminaSogno = (id: number) => {
    setSogniSalvati(removeDream(id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 dark:from-indigo-900 dark:to-purple-900 light:from-blue-100 light:to-purple-100 p-4 md:p-6 transition-colors duration-500">
      <LoadingOverlay isVisible={loading} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center">
            <Moon className="h-6 w-6 md:h-8 md:w-8 mr-2 dark:text-yellow-200 light:text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white light:text-gray-800">Narratore di Sogni</h1>
            <span className="hidden sm:inline-block ml-2 px-2 py-1 rounded text-xs dark:bg-purple-700 dark:text-purple-200 light:bg-indigo-100 light:text-indigo-600">
              Powered by Claude
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Input column */}
          <div className="w-full md:w-1/2">
            <DreamInput
              onSubmit={inviaSogno}
              onReset={resetForm}
              loading={loading}
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
          <p>Narratore di Sogni © 2025 - Powered by Claude AI</p>
          <p className="mt-1">Trasforma i tuoi sogni in storie uniche con l'intelligenza artificiale</p>
        </div>
      </div>
    </div>
  );
}
