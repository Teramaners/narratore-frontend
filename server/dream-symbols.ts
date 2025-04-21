import { GoogleGenerativeAI } from '@google/generative-ai';
import { fallbackDreamSymbols, getFallbackExtractedSymbols } from './dream-symbols-fallback';

interface DreamSymbolResponse {
  symbol: string;
  meanings: {
    general: string;
    psychological: string;
    cultural: string[];
  };
  relatedSymbols: string[];
  categories: string[];
}

interface SymbolPosition {
  symbol: string;
  start: number;
  end: number;
}

interface DreamSymbolsResponse {
  mainSymbols: Array<{
    symbol: string;
    briefDescription: string;
  }>;
  symbolPositions?: SymbolPosition[];
}

// Estrae i simboli principali dal testo del sogno
export async function extractDreamSymbols(dreamText: string, includePositions: boolean = false): Promise<DreamSymbolsResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY non trovata, utilizzo dati di fallback');
      return getFallbackExtractedSymbols(dreamText);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const prompt = `
    Analizza il seguente testo di un sogno ed estrai i simboli principali presenti. Identifica solo gli elementi significativi che potrebbero avere un valore simbolico nell'interpretazione dei sogni.
    
    Per ogni simbolo, fornisci una brevissima descrizione (massimo 10-15 parole).
    
    Testo del sogno:
    "${dreamText}"
    
    Rispondi in formato JSON con la seguente struttura:
    {
      "mainSymbols": [
        {
          "symbol": "nome del simbolo",
          "briefDescription": "breve descrizione"
        }
      ]
    }
    
    Limita la risposta a massimo 7 simboli, selezionando quelli più significativi.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Estrai il JSON dalla risposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato di risposta non valido');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]) as DreamSymbolsResponse;
      
      // Se richiesto, aggiungi le posizioni dei simboli nel testo
      if (includePositions && parsedResponse.mainSymbols && parsedResponse.mainSymbols.length > 0) {
        const positions = findSymbolPositions(dreamText, parsedResponse.mainSymbols);
        parsedResponse.symbolPositions = positions;
      }
      
      return parsedResponse;
    } catch (apiError) {
      // Se l'API fallisce (es. quota superata), utilizza i dati di fallback
      console.log('API Gemini non disponibile, utilizzo dati di fallback');
      return getFallbackExtractedSymbols(dreamText);
    }
  } catch (error) {
    console.error('Errore nell\'estrazione dei simboli del sogno:', error);
    // Utilizza i dati di fallback in caso di errore
    return getFallbackExtractedSymbols(dreamText);
  }
}

// Ottiene informazioni dettagliate su un simbolo specifico
export async function getDreamSymbolInfo(symbol: string): Promise<DreamSymbolResponse> {
  try {
    // Controlla se il simbolo è presente nei dati di fallback
    // Normalizza il simbolo rimuovendo maiuscole e spazi
    const normalizedSymbol = symbol.toLowerCase().trim();
    
    // Cerca nei dati di fallback
    for (const key in fallbackDreamSymbols) {
      const fallbackSymbol = fallbackDreamSymbols[key as keyof typeof fallbackDreamSymbols];
      if (fallbackSymbol.symbol.toLowerCase() === normalizedSymbol) {
        console.log(`Simbolo "${symbol}" trovato nei dati di fallback`);
        return fallbackSymbol;
      }
    }
    
    // Se non è trovato nei dati di fallback, prova con l'API
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY non trovata, utilizzando risposta generica');
      return {
        symbol,
        meanings: {
          general: `Il simbolo "${symbol}" rappresenta concetti e significati che variano in base al contesto personale e culturale.`,
          psychological: `Nella psicologia dei sogni, "${symbol}" può rappresentare aspetti della tua psiche o esperienze emotive.`,
          cultural: [
            `In molte culture occidentali, "${symbol}" è associato a concetti di trasformazione e cambiamento.`,
            `Nelle tradizioni orientali, potrebbe simboleggiare equilibrio o armonia.`,
            `In varie mitologie, questo simbolo appare come rappresentazione di forze naturali o divine.`
          ]
        },
        relatedSymbols: ["Oggetto", "Concetto", "Immagine"],
        categories: ["Generale", "Simboli"]
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const prompt = `
    Fornisci un'analisi dettagliata del simbolo "${symbol}" nel contesto dell'interpretazione dei sogni.
    
    Includi:
    1. Un significato generale
    2. Interpretazione psicologica (approccio junghiano o freudiano)
    3. Variazioni culturali (almeno 3 diverse culture)
    4. Simboli correlati (almeno 3)
    5. Categorie a cui appartiene (es. natura, animali, oggetti quotidiani)
    
    Rispondi in formato JSON con la seguente struttura:
    {
      "symbol": "${symbol}",
      "meanings": {
        "general": "significato generale",
        "psychological": "interpretazione psicologica",
        "cultural": ["interpretazione cultura 1", "interpretazione cultura 2", "interpretazione cultura 3"]
      },
      "relatedSymbols": ["simbolo1", "simbolo2", "simbolo3"],
      "categories": ["categoria1", "categoria2"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Estrai il JSON dalla risposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato di risposta non valido');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]) as DreamSymbolResponse;
      return parsedResponse;
    } catch (apiError) {
      // Se l'API fallisce (es. quota superata), fornisci una risposta generica
      console.log('API Gemini non disponibile, fornendo risposta generica');
      return {
        symbol,
        meanings: {
          general: `Il simbolo "${symbol}" rappresenta concetti e significati che variano in base al contesto personale e culturale.`,
          psychological: `Nella psicologia dei sogni, "${symbol}" può rappresentare aspetti della tua psiche o esperienze emotive.`,
          cultural: [
            `In molte culture occidentali, "${symbol}" è associato a concetti di trasformazione e cambiamento.`,
            `Nelle tradizioni orientali, potrebbe simboleggiare equilibrio o armonia.`,
            `In varie mitologie, questo simbolo appare come rappresentazione di forze naturali o divine.`
          ]
        },
        relatedSymbols: ["Oggetto", "Concetto", "Immagine"],
        categories: ["Generale", "Simboli"]
      };
    }
  } catch (error) {
    console.error('Errore nel recupero delle informazioni sul simbolo:', error);
    return {
      symbol,
      meanings: {
        general: `Il simbolo "${symbol}" rappresenta concetti che variano in base al contesto personale.`,
        psychological: `Nella psicologia dei sogni, "${symbol}" può rappresentare diversi aspetti della psiche.`,
        cultural: ['Le interpretazioni variano significativamente tra diverse culture.']
      },
      relatedSymbols: ["Concetto", "Immagine"],
      categories: ["Generale"]
    };
  }
}

// Calcola la somiglianza tra due stringhe
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length.toString());
}

// Calcola la distanza di Levenshtein tra due stringhe
function editDistance(s1: string, s2: string): number {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = new Array(s2.length + 1);
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

// Trova le posizioni di ogni simbolo nel testo
function findSymbolPositions(text: string, symbols: Array<{symbol: string; briefDescription: string}>): SymbolPosition[] {
  const positions: SymbolPosition[] = [];
  const lowerText = text.toLowerCase();
  
  symbols.forEach(symbolObj => {
    const symbolLower = symbolObj.symbol.toLowerCase();
    let startPos = 0;
    
    // Per ogni simbolo, trova tutte le occorrenze
    while (startPos < lowerText.length) {
      const foundIndex = lowerText.indexOf(symbolLower, startPos);
      if (foundIndex === -1) break;
      
      // Verifica che l'occorrenza sia una parola completa
      const prevChar = foundIndex > 0 ? lowerText[foundIndex - 1] : ' ';
      const nextChar = foundIndex + symbolLower.length < lowerText.length 
        ? lowerText[foundIndex + symbolLower.length] 
        : ' ';
      
      const isPrevBoundary = /[\s.,;:!?\"'()[\]{}]/.test(prevChar);
      const isNextBoundary = /[\s.,;:!?\"'()[\]{}]/.test(nextChar);
      
      if (isPrevBoundary && isNextBoundary) {
        // Usa il testo originale per preservare la formattazione esatta
        const originalSymbol = text.substring(foundIndex, foundIndex + symbolObj.symbol.length);
        
        positions.push({
          symbol: symbolObj.symbol,
          start: foundIndex,
          end: foundIndex + symbolObj.symbol.length
        });
      }
      
      startPos = foundIndex + 1;
    }
  });
  
  // Ordina le posizioni per inizio
  return positions.sort((a, b) => a.start - b.start);
}

// Lista di categorie comuni per i simboli nei sogni
export const dreamSymbolCategories = [
  "Natura",
  "Animali",
  "Persone",
  "Luoghi",
  "Oggetti",
  "Elementi",
  "Emozioni",
  "Azioni",
  "Situazioni",
  "Spirituale",
  "Mitologico",
  "Famiglia",
  "Lavoro",
  "Viaggio"
];