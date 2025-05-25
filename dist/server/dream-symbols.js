"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamSymbolCategories = void 0;
exports.extractDreamSymbols = extractDreamSymbols;
exports.getDreamSymbolInfo = getDreamSymbolInfo;
const generative_ai_1 = require("@google/generative-ai");
const dream_symbols_fallback_1 = require("./dream-symbols-fallback");
// Estrae i simboli principali dal testo del sogno
function extractDreamSymbols(dreamText_1) {
    return __awaiter(this, arguments, void 0, function* (dreamText, includePositions = false) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.log('GEMINI_API_KEY non trovata, utilizzo dati di fallback');
                return (0, dream_symbols_fallback_1.getFallbackExtractedSymbols)(dreamText);
            }
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                const result = yield model.generateContent(prompt);
                const responseText = result.response.text();
                // Estrai il JSON dalla risposta
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Formato di risposta non valido');
                }
                const parsedResponse = JSON.parse(jsonMatch[0]);
                // Se richiesto, aggiungi le posizioni dei simboli nel testo
                if (includePositions && parsedResponse.mainSymbols && parsedResponse.mainSymbols.length > 0) {
                    const positions = findSymbolPositions(dreamText, parsedResponse.mainSymbols);
                    parsedResponse.symbolPositions = positions;
                }
                return parsedResponse;
            }
            catch (apiError) {
                // Se l'API fallisce (es. quota superata), utilizza i dati di fallback
                console.log('API Gemini non disponibile, utilizzo dati di fallback');
                return (0, dream_symbols_fallback_1.getFallbackExtractedSymbols)(dreamText, includePositions);
            }
        }
        catch (error) {
            console.error('Errore nell\'estrazione dei simboli del sogno:', error);
            // Utilizza i dati di fallback in caso di errore
            return (0, dream_symbols_fallback_1.getFallbackExtractedSymbols)(dreamText, includePositions);
        }
    });
}
// Ottiene informazioni dettagliate su un simbolo specifico
function getDreamSymbolInfo(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Controlla se il simbolo è presente nei dati di fallback
            // Normalizza il simbolo rimuovendo maiuscole e spazi
            const normalizedSymbol = symbol.toLowerCase().trim();
            // Cerca nei dati di fallback
            for (const key in dream_symbols_fallback_1.fallbackDreamSymbols) {
                const fallbackSymbol = dream_symbols_fallback_1.fallbackDreamSymbols[key];
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
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                const result = yield model.generateContent(prompt);
                const responseText = result.response.text();
                // Estrai il JSON dalla risposta
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Formato di risposta non valido');
                }
                const parsedResponse = JSON.parse(jsonMatch[0]);
                return parsedResponse;
            }
            catch (apiError) {
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
        }
        catch (error) {
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
    });
}
// Calcola la somiglianza tra due stringhe
function similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) {
        return 1.0;
    }
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length.toString());
}
// Calcola la distanza di Levenshtein tra due stringhe
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = new Array(s2.length + 1);
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            }
            else if (j > 0) {
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
function findSymbolPositions(text, symbols) {
    const positions = [];
    const lowerText = text.toLowerCase();
    symbols.forEach(symbolObj => {
        const symbolLower = symbolObj.symbol.toLowerCase();
        let startPos = 0;
        // Per ogni simbolo, trova tutte le occorrenze
        while (startPos < lowerText.length) {
            const foundIndex = lowerText.indexOf(symbolLower, startPos);
            if (foundIndex === -1)
                break;
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
exports.dreamSymbolCategories = [
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
