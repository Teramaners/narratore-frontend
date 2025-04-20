import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmotionGradient } from './emotion-gradient';
import { emotionToEnglish } from '@/lib/emotions';

interface DreamEntry {
  id: number;
  content: string;
  story: string;
  createdAt: string;
  category?: string;
  emotion?: string;
  isFavorite?: number | boolean;
  // Aggiungiamo anche le versioni italiane per compatibilità
  testo?: string;
  racconto?: string;
  categoria?: string;
  emozione?: string;
  preferito?: boolean;
}

interface DreamTimelineProps {
  dreams: DreamEntry[];
  onSelectDream: (dream: DreamEntry) => void;
}

export function DreamTimeline({ dreams, onSelectDream }: DreamTimelineProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [entriesPerPage, setEntriesPerPage] = useState(3);
  
  // Ordina i sogni per data
  const sortedDreams = [...dreams].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Ordine decrescente (più recenti prima)
  });

  // Calcola il numero totale di pagine
  const totalPages = Math.ceil(sortedDreams.length / entriesPerPage);
  
  // Seleziona i sogni da visualizzare nella pagina corrente
  const displayedDreams = sortedDreams.slice(
    currentPage * entriesPerPage, 
    (currentPage + 1) * entriesPerPage
  );
  
  // Regola dinamicamente il numero di sogni visualizzati in base alla larghezza dello schermo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // Mobile
        setEntriesPerPage(1);
      } else if (window.innerWidth < 1024) { // Tablet
        setEntriesPerPage(2);
      } else { // Desktop
        setEntriesPerPage(3);
      }
    };
    
    // Imposta il valore iniziale
    handleResize();
    
    // Aggiungi listener per il ridimensionamento
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestisce il cambio di pagina
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Gestisce il salto ad una pagina specifica
  const jumpToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  // Ottiene la categoria o emozione localizzata in italiano
  const getCategoryName = (category?: string) => {
    switch (category) {
      case 'adventure': return 'Avventura';
      case 'scary': return 'Spaventoso';
      case 'romantic': return 'Romantico';
      case 'mystery': return 'Mistero';
      case 'fantasy': return 'Fantasia';
      case 'funny': return 'Divertente';
      case 'non_categorizzato': return 'Non categorizzato';
      default: return category || 'Non categorizzato';
    }
  };
  
  const getEmotionName = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'Felice';
      case 'sad': return 'Triste';
      case 'curious': return 'Curioso';
      case 'scared': return 'Spaventato';
      case 'excited': return 'Eccitato';
      case 'confused': return 'Confuso';
      case 'neutral': 
      case 'neutro': return 'Neutro';
      default: return emotion || 'Neutro';
    }
  };
  
  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-500 text-white';
      case 'sad': return 'bg-blue-500 text-white';
      case 'curious': return 'bg-purple-500 text-white';
      case 'scared': return 'bg-red-500 text-white';
      case 'excited': return 'bg-yellow-500 text-black';
      case 'confused': return 'bg-gray-500 text-white';
      case 'neutral':
      case 'neutro': 
      default: return 'bg-gray-300 text-gray-800';
    }
  };
  
  if (dreams.length === 0) {
    return (
      <div className="p-6 text-center dark:text-white light:text-gray-800">
        <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <h3 className="text-lg font-semibold">Nessun sogno nella timeline</h3>
        <p className="text-sm text-muted-foreground">Inizia a registrare i tuoi sogni per vederli apparire qui.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white light:text-gray-800">
          <Calendar className="inline-block mr-2 h-5 w-5" />
          Timeline dei Sogni
        </h3>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage} 
            disabled={currentPage === 0}
            aria-label="Pagina precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm dark:text-white light:text-gray-800 px-2">
            {currentPage + 1} / {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages - 1}
            aria-label="Pagina successiva"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Linea della timeline */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
        
        {/* Elementi della timeline */}
        <div className="space-y-4">
          {displayedDreams.map((dream, index) => {
            // Determina quale versione dei dati utilizzare (inglese o italiano)
            const content = dream.content || dream.testo || '';
            const category = dream.category || dream.categoria || 'non_categorizzato';
            const emotion = dream.emotion || dream.emozione || 'neutro';
            const isFavorite = dream.isFavorite || dream.preferito || false;
            const dateStr = dream.createdAt || new Date().toISOString();
            
            // Timestamp e formato data
            const date = parseISO(dateStr);
            const formattedDate = format(date, 'dd MMMM yyyy', { locale: it });
            const formattedTime = format(date, 'HH:mm', { locale: it });

            return (
              <div key={dream.id} className="flex items-start ml-2">
                {/* Cerchio del nodo timeline */}
                <div className="flex-shrink-0 -ml-2 mr-3">
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-full border-2 border-white", 
                      isFavorite ? "bg-yellow-400" : "bg-purple-500"
                    )}
                  ></div>
                </div>
                
                {/* Card del contenuto */}
                <Card 
                  className={cn(
                    "flex-grow p-4 hover:shadow-md transition-shadow dark:bg-gray-800/60 light:bg-white cursor-pointer", 
                    isFavorite ? "border-yellow-400 border-2" : ""
                  )}
                  onClick={() => onSelectDream(dream)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium dark:text-white light:text-gray-800 flex items-center">
                        {isFavorite && <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />}
                        {formattedDate} <span className="text-xs opacity-70 ml-1">alle {formattedTime}</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="capitalize">
                          {getCategoryName(category)}
                        </Badge>
                        <EmotionGradient 
                          emotion={emotionToEnglish(emotion)}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm dark:text-gray-300 light:text-gray-600 line-clamp-2">
                      {content}
                    </p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Paginazione avanzata (se ci sono più di 5 pagine) */}
      {totalPages > 5 && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logica per mostrare le pagine vicine a quella corrente
            let pageIndex = i;
            if (currentPage > 2) {
              pageIndex = currentPage - 2 + i;
            }
            if (pageIndex >= totalPages) {
              pageIndex = totalPages - 5 + i;
            }
            
            return (
              <Button 
                key={i}
                variant={currentPage === pageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => jumpToPage(pageIndex)}
                className="w-8 h-8 p-0"
              >
                {pageIndex + 1}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}