import { useState, useEffect, Fragment, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DreamSymbolHoverCard } from "./dream-symbol-hover-card";

interface DreamSymbolHighlighterProps {
  text: string;
  onSymbolClick?: (symbol: string) => void;
  className?: string;
}

interface SymbolOccurrence {
  symbol: string;
  start: number;
  end: number;
}

interface TextSegment {
  text: string;
  isSymbol: boolean;
  symbol?: string;
  briefDescription?: string;
  symbolInfo?: any;
}

export function DreamSymbolHighlighter({
  text,
  onSymbolClick,
  className = "",
}: DreamSymbolHighlighterProps) {
  const [segments, setSegments] = useState<TextSegment[]>([{ text, isSymbol: false }]);
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  
  // Mutazione per estrarre simboli dal testo
  const extractSymbolsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/simboli-sogno/estrai", { 
        testo: text,
        includePositions: true  // Richiediamo anche le posizioni nel testo
      });
      return await response.json();
    },
  });
  
  // Query per ottenere informazioni dettagliate sul simbolo al passaggio del mouse
  const { data: symbolInfo } = useQuery({
    queryKey: ["/api/simboli-sogno", hoveredSymbol],
    queryFn: async () => {
      if (!hoveredSymbol) return null;
      const response = await apiRequest("GET", `/api/simboli-sogno/${encodeURIComponent(hoveredSymbol)}`);
      return await response.json();
    },
    enabled: !!hoveredSymbol,
  });
  
  // Estrae i simboli quando il componente viene montato
  useEffect(() => {
    if (text) {
      extractSymbolsMutation.mutate(text);
    }
  }, [text]);
  
  // Aggiorna i segmenti quando i simboli vengono estratti
  useEffect(() => {
    if (extractSymbolsMutation.isSuccess && extractSymbolsMutation.data?.mainSymbols) {
      const symbolsWithPositions = extractSymbolsMutation.data.symbolPositions || [];
      
      if (symbolsWithPositions.length === 0) {
        // Se non ci sono posizioni, mantieni il testo originale
        setSegments([{ text, isSymbol: false }]);
        return;
      }
      
      // Ordina le occorrenze dei simboli per posizione di inizio
      const sortedOccurrences = [...symbolsWithPositions].sort((a, b) => a.start - b.start);
      
      // Crea un array di segmenti di testo alternando testo normale e simboli
      const newSegments: TextSegment[] = [];
      let lastEnd = 0;
      
      sortedOccurrences.forEach((occurrence) => {
        // Aggiungi il testo prima del simbolo corrente
        if (occurrence.start > lastEnd) {
          newSegments.push({
            text: text.substring(lastEnd, occurrence.start),
            isSymbol: false,
          });
        }
        
        // Trova le informazioni del simbolo
        const symbolData = extractSymbolsMutation.data.mainSymbols.find(
          (s: any) => s.symbol.toLowerCase() === occurrence.symbol.toLowerCase()
        );
        
        // Aggiungi il simbolo
        if (symbolData) {
          newSegments.push({
            text: text.substring(occurrence.start, occurrence.end),
            isSymbol: true,
            symbol: symbolData.symbol,
            briefDescription: symbolData.briefDescription,
          });
        } else {
          // Se per qualche motivo non troviamo i dati del simbolo, mostriamo solo il testo
          newSegments.push({
            text: text.substring(occurrence.start, occurrence.end),
            isSymbol: false,
          });
        }
        
        lastEnd = occurrence.end;
      });
      
      // Aggiungi il testo rimanente dopo l'ultimo simbolo
      if (lastEnd < text.length) {
        newSegments.push({
          text: text.substring(lastEnd),
          isSymbol: false,
        });
      }
      
      setSegments(newSegments);
    }
  }, [extractSymbolsMutation.isSuccess, extractSymbolsMutation.data]);
  
  const handleSymbolMouseEnter = (symbol: string) => {
    setHoveredSymbol(symbol);
  };
  
  const handleSymbolMouseLeave = () => {
    setHoveredSymbol(null);
  };
  
  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (!segment.isSymbol) {
          return <Fragment key={index}>{segment.text}</Fragment>;
        }
        
        const symbolData = segment.symbol 
          ? extractSymbolsMutation.data?.mainSymbols.find(
              (s: any) => s.symbol.toLowerCase() === segment.symbol?.toLowerCase()
            )
          : null;
        
        // Ottieni informazioni aggiuntive dal symbolInfo se disponibili
        const categories = 
          (hoveredSymbol === segment.symbol && symbolInfo?.categories) 
            ? symbolInfo.categories 
            : [];
            
        const relatedSymbols = 
          (hoveredSymbol === segment.symbol && symbolInfo?.relatedSymbols) 
            ? symbolInfo.relatedSymbols 
            : [];
            
        const generalMeaning = 
          (hoveredSymbol === segment.symbol && symbolInfo?.meanings?.general) 
            ? symbolInfo.meanings.general 
            : "";

        return (
          <DreamSymbolHoverCard
            key={index}
            symbol={segment.symbol || ""}
            briefDescription={segment.briefDescription || ""}
            className="text-primary-600 hover:text-primary transition-colors cursor-pointer"
            onSymbolClick={onSymbolClick}
            categories={categories}
            relatedSymbols={relatedSymbols}
            generalMeaning={generalMeaning}
          >
            <span 
              onMouseEnter={() => handleSymbolMouseEnter(segment.symbol || "")}
              onMouseLeave={handleSymbolMouseLeave}
            >
              {segment.text}
            </span>
          </DreamSymbolHoverCard>
        );
      })}
    </div>
  );
}