import { GoogleGenerativeAI } from '@google/generative-ai';

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

interface DreamSymbolsResponse {
  mainSymbols: Array<{
    symbol: string;
    briefDescription: string;
  }>;
}

// Estrae i simboli principali dal testo del sogno
export async function extractDreamSymbols(dreamText: string): Promise<DreamSymbolsResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non trovata. Configura la tua chiave API Gemini.');
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Estrai il JSON dalla risposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato di risposta non valido');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]) as DreamSymbolsResponse;
    return parsedResponse;
  } catch (error) {
    console.error('Errore nell\'estrazione dei simboli del sogno:', error);
    return {
      mainSymbols: []
    };
  }
}

// Ottiene informazioni dettagliate su un simbolo specifico
export async function getDreamSymbolInfo(symbol: string): Promise<DreamSymbolResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non trovata. Configura la tua chiave API Gemini.');
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Estrai il JSON dalla risposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato di risposta non valido');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]) as DreamSymbolResponse;
    return parsedResponse;
  } catch (error) {
    console.error('Errore nel recupero delle informazioni sul simbolo:', error);
    return {
      symbol,
      meanings: {
        general: 'Informazioni non disponibili',
        psychological: 'Informazioni non disponibili',
        cultural: ['Informazioni non disponibili']
      },
      relatedSymbols: [],
      categories: []
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