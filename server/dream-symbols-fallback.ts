// Dati di fallback per i simboli dei sogni
// Questi dati verranno utilizzati quando l'API Gemini non è disponibile

export interface DreamSymbol {
  symbol: string;
  meanings: {
    general: string;
    psychological: string;
    cultural: string[];
  };
  relatedSymbols: string[];
  categories: string[];
}

export interface FallbackDreamSymbols {
  [key: string]: DreamSymbol;
}

export const fallbackDreamSymbols: FallbackDreamSymbols = {
  "acqua": {
    symbol: "Acqua",
    meanings: {
      general: "L'acqua nei sogni simboleggia le tue emozioni, l'inconscio e la vita spirituale. Acque calme possono indicare pace interiore, mentre acque agitate possono riflettere turbamento emotivo.",
      psychological: "Secondo Jung, l'acqua rappresenta l'inconscio collettivo e la profondità della psiche. Per Freud, spesso simboleggia la nascita o ha connotazioni di fertilità e sessualità.",
      cultural: [
        "Nella cultura indù, l'acqua è associata alla purificazione e rappresenta il flusso della vita e lo scioglimento del karma.",
        "Per i nativi americani, l'acqua è uno degli elementi sacri, associata alla guarigione emotiva e alla purificazione spirituale.",
        "Nella tradizione cristiana, l'acqua simboleggia la purezza, il battesimo e la rinascita spirituale."
      ]
    },
    relatedSymbols: ["Oceano", "Pioggia", "Fiume", "Lago"],
    categories: ["Natura", "Elementi", "Spirituale"]
  },
  
  "volare": {
    symbol: "Volare",
    meanings: {
      general: "Volare nei sogni spesso rappresenta libertà, trascendenza delle limitazioni, prospettiva elevata sulla vita o desiderio di sfuggire dalle situazioni attuali.",
      psychological: "Psicologicamente, il volo nei sogni può indicare il desiderio di libertà dalle restrizioni o dalle pressioni quotidiane. Jung lo considerava un simbolo di trascendenza, mentre Freud poteva interpretarlo come desiderio sessuale o di potere.",
      cultural: [
        "In molte culture sciamaniche, il volo rappresenta il viaggio dell'anima in altri regni durante stati alterati di coscienza.",
        "Nella mitologia greca, figure come Icaro mostrano sia l'aspirazione umana di elevarsi sia i pericoli dell'arroganza.",
        "Nel Buddhismo, il volo può simboleggiare la liberazione dal ciclo del samsara e il raggiungimento dell'illuminazione."
      ]
    },
    relatedSymbols: ["Uccelli", "Ali", "Cielo", "Cadere"],
    categories: ["Azioni", "Libertà", "Spirituale"]
  },
  
  "casa": {
    symbol: "Casa",
    meanings: {
      general: "La casa nei sogni rappresenta spesso il sé, l'identità personale o lo stato della tua vita. Stanze diverse possono simboleggiare aspetti diversi della tua personalità o della tua vita.",
      psychological: "Secondo Jung, la casa è un simbolo del sé e dell'identità. Le stanze nascoste o sconosciute possono rappresentare aspetti inesplorati della personalità. Freud vedeva la casa come simbolo del corpo, con porte e finestre che rappresentano aperture per l'espressione o la repressione.",
      cultural: [
        "Nella cultura cinese, la casa è legata al concetto di feng shui e rappresenta l'armonia e l'equilibrio tra l'individuo e l'ambiente.",
        "Per molte culture africane, la casa è un simbolo di connessione ancestrale e continuità familiare.",
        "Nelle culture nordiche, la casa rappresentava rifugio contro le forze naturali ostili e simboleggiava protezione e sopravvivenza."
      ]
    },
    relatedSymbols: ["Porta", "Stanza", "Famiglia", "Fondamenta"],
    categories: ["Luoghi", "Sicurezza", "Identità"]
  },
  
  "cadere": {
    symbol: "Cadere",
    meanings: {
      general: "Cadere nei sogni spesso riflette insicurezze, perdita di controllo, paura del fallimento o sensazione di essere sopraffatti dalle circostanze della vita.",
      psychological: "Dal punto di vista junghiano, cadere può rappresentare il passaggio a un livello più profondo di consapevolezza o l'emergere di contenuti dall'inconscio. Freud lo interpretava come ansia legata alla performance sessuale o paura del fallimento.",
      cultural: [
        "Nel folklore europeo medievale, sogni di caduta erano considerati presagi di malattia o sfortuna imminente.",
        "In alcune tradizioni native americane, la caduta nei sogni è vista come un viaggio spirituale o una connessione con il mondo sotterraneo.",
        "Nella cultura giapponese, cadere può essere associato al concetto di 'perdere la faccia' o l'onore nella società."
      ]
    },
    relatedSymbols: ["Precipizio", "Altezza", "Volare", "Precipitare"],
    categories: ["Azioni", "Paura", "Perdita di controllo"]
  },
  
  "denti": {
    symbol: "Denti",
    meanings: {
      general: "I denti nei sogni spesso simboleggiano sicurezza, potere, autostima o comunicazione. Sognare denti che cadono può riflettere ansia riguardo all'apparenza, paura dell'invecchiamento o preoccupazioni sulla comunicazione.",
      psychological: "Freud vedeva i sogni sui denti come simboli di ansia da castrazione o repressione sessuale. Jung li interpretava come rappresentazioni di crisi di sviluppo o transizioni importanti nella vita.",
      cultural: [
        "In molte culture occidentali, sognare di perdere i denti è considerato un presagio di morte nella famiglia o tra gli amici.",
        "Nella tradizione cinese, sognare denti che cadono può indicare problemi o perdite finanziarie.",
        "Per alcune tribù africane, i denti nei sogni sono collegati al potere personale e all'autorità nella comunità."
      ]
    },
    relatedSymbols: ["Bocca", "Mordere", "Masticare", "Parlare"],
    categories: ["Corpo", "Comunicazione", "Potere", "Ansia"]
  },
  
  "serpente": {
    symbol: "Serpente",
    meanings: {
      general: "I serpenti nei sogni possono simboleggiare saggezza, trasformazione, guarigione, energia sessuale o pericolo nascosto, a seconda del contesto e dell'interazione.",
      psychological: "Jung vedeva il serpente come un simbolo dell'inconscio e della saggezza istintiva. Per Freud, era principalmente un simbolo fallico e sessuale. In generale, rappresenta spesso forze primitive e potenti della psiche.",
      cultural: [
        "Nella tradizione biblica, il serpente è associato alla tentazione e all'inganno.",
        "In molte culture indù, il serpente (naga) è sacro e rappresenta energia kundalini, risveglio spirituale e immortalità.",
        "Nelle tradizioni aborigene australiane, il Serpente Arcobaleno è un essere creatore associato all'acqua, alla vita e alla creazione."
      ]
    },
    relatedSymbols: ["Drago", "Rinascita", "Medicina", "Tentazione"],
    categories: ["Animali", "Trasformazione", "Spirituale", "Energia"]
  },
  
  "inseguimento": {
    symbol: "Inseguimento",
    meanings: {
      general: "Essere inseguiti nei sogni spesso riflette problemi o responsabilità da cui state cercando di fuggire nella vita reale, o aspetti di voi stessi che non volete affrontare.",
      psychological: "La psicologia junghiana interpreta gli inseguimenti come l'ombra (parti represse del sé) che cerca di essere riconosciuta e integrata. Per Freud, poteva rappresentare ansia repressa o trauma.",
      cultural: [
        "Nel folklore europeo, l'inseguimento nei sogni è stato tradizionalmente interpretato come segno di colpa morale o persecuzione spirituale.",
        "In alcune culture dell'Asia orientale, essere inseguiti può simboleggiare spiriti ancestrali che cercano attenzione o offerte.",
        "Nelle interpretazioni moderne occidentali, l'inseguimento è spesso visto come manifestazione dello stress quotidiano e dell'ansia da prestazione."
      ]
    },
    relatedSymbols: ["Fuga", "Mostro", "Nascondersi", "Paura"],
    categories: ["Azioni", "Paura", "Conflitto", "Evitamento"]
  },
  
  "bambino": {
    symbol: "Bambino",
    meanings: {
      general: "Un bambino nei sogni può rappresentare innocenza, potenziale di crescita, nuovi inizi, vulnerabilità o il proprio bambino interiore.",
      psychological: "Jung vedeva il bambino come un archetipo che rappresenta potenziale, rinnovamento e il sé emergente. Per Freud, poteva riflettere desideri di procreazione o ricordi dell'infanzia.",
      cultural: [
        "In molte culture africane, i bambini nei sogni possono rappresentare gli antenati che ritornano o anime che desiderano nascere.",
        "Nella tradizione cinese, sognare bambini è considerato di buon auspicio e può simboleggiare prosperità e fortuna.",
        "Nelle interpretazioni cristiane, il bambino può rappresentare innocenza, purezza o rinascita spirituale."
      ]
    },
    relatedSymbols: ["Nascita", "Gioco", "Innocenza", "Crescita"],
    categories: ["Persone", "Inizio", "Potenziale", "Famiglia"]
  }
};

// Restituisce simboli estratti da un testo di sogno (simulazione)
// Interfaccia per le posizioni dei simboli
interface SymbolPosition {
  symbol: string;
  start: number;
  end: number;
}

// Funzione per trovare le posizioni dei simboli nel testo
function findSymbolPositionsInText(text: string, symbols: Array<{symbol: string; briefDescription: string}>): SymbolPosition[] {
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

export function getFallbackExtractedSymbols(dreamText: string, includePositions: boolean = false) {
  // Lista di parole chiave da cercare nel testo del sogno
  const keywordsToSymbols: {[key: string]: string} = {
    // Acqua e relativi
    "acqua": "acqua",
    "mare": "acqua",
    "oceano": "acqua",
    "lago": "acqua",
    "fiume": "acqua",
    "pioggia": "acqua",
    "bagnato": "acqua",
    "nuotare": "acqua",
    "tuffo": "acqua",
    "vasche": "acqua",
    "goccia": "acqua",
    "fontana": "acqua",
    "bere": "acqua",
    
    // Volare e cielo
    "volare": "volare",
    "volo": "volare",
    "ali": "volare",
    "cielo": "volare",
    "nuvole": "volare",
    "uccello": "volare",
    "aereo": "volare",
    "alto": "volare",
    "sorvolare": "volare",
    "planare": "volare",
    "fluttuare": "volare",
    "librarsi": "volare",
    
    // Casa e luoghi chiusi
    "casa": "casa",
    "appartamento": "casa",
    "edificio": "casa",
    "stanza": "casa",
    "dimora": "casa",
    "tetto": "casa",
    "muro": "casa",
    "abitazione": "casa",
    "camera": "casa",
    "soggiorno": "casa",
    "cucina": "casa",
    "bagni": "casa",
    "porta": "casa",
    "finestra": "casa",
    "scale": "casa",
    
    // Cadere e precipitare
    "cadere": "cadere",
    "caduta": "cadere",
    "precipitare": "cadere",
    "precipizio": "cadere",
    "scivolare": "cadere",
    "inciampare": "cadere",
    "crollare": "cadere",
    "scendere": "cadere",
    "altezza": "cadere",
    "vertigini": "cadere",
    "vuoto": "cadere",
    "abisso": "cadere",
    
    // Denti e bocca
    "denti": "denti",
    "dente": "denti",
    "bocca": "denti",
    "mascella": "denti",
    "mordere": "denti",
    "masticare": "denti",
    "sorriso": "denti",
    "lingua": "denti",
    "perdere denti": "denti",
    "rompere denti": "denti",
    
    // Serpenti e rettili
    "serpente": "serpente",
    "serpenti": "serpente",
    "rettile": "serpente",
    "vipera": "serpente",
    "cobra": "serpente",
    "pitone": "serpente",
    "squame": "serpente",
    "strisciare": "serpente",
    "sibilare": "serpente",
    "veleno": "serpente",
    "morso": "serpente",
    
    // Inseguimento e fuga
    "inseguire": "inseguimento",
    "inseguito": "inseguimento",
    "rincorrere": "inseguimento",
    "fuggire": "inseguimento",
    "scappare": "inseguimento",
    "correre": "inseguimento",
    "fuga": "inseguimento",
    "caccia": "inseguimento",
    "preda": "inseguimento",
    "predatore": "inseguimento",
    "sfuggire": "inseguimento",
    "nascondersi": "inseguimento",
    "paura": "inseguimento",
    
    // Bambini e infanzia
    "bambino": "bambino",
    "bambina": "bambino",
    "neonato": "bambino",
    "infante": "bambino",
    "bimbo": "bambino",
    "piccolo": "bambino",
    "figlio": "bambino",
    "figlia": "bambino",
    "nascita": "bambino",
    "infanzia": "bambino",
    "culla": "bambino",
    "giocare": "bambino",
    "giocattolo": "bambino"
  };
  
  // Aggiungi simboli per la gara ciclistica
  fallbackDreamSymbols["gara"] = {
    symbol: "Competizione",
    meanings: {
      general: "Le competizioni nei sogni simboleggiano la rivalità, l'ambizione e il desiderio di distinguersi. Possono riflettere situazioni di conflitto o sfida nella vita reale.",
      psychological: "Secondo Jung, le competizioni nei sogni rappresentano l'aspirazione all'individuazione e il confronto con parti di sé. Per Freud, possono simboleggiare rivalità tra fratelli o con figure genitoriali.",
      cultural: [
        "Nelle culture occidentali moderne, la competizione è spesso collegata al successo e all'affermazione personale.",
        "In molte filosofie orientali, come il taoismo, la competizione è vista come un allontanamento dall'armonia naturale.",
        "Nelle società tribali, le competizioni rituali servono come meccanismi per stabilire gerarchie sociali senza ricorrere alla violenza."
      ]
    },
    relatedSymbols: ["Vittoria", "Sconfitta", "Premio", "Avversario"],
    categories: ["Situazioni", "Azioni", "Relazioni sociali"]
  };
  
  keywordsToSymbols["gara"] = "gara";
  keywordsToSymbols["competizione"] = "gara";
  keywordsToSymbols["sfida"] = "gara";
  keywordsToSymbols["vincere"] = "gara";
  keywordsToSymbols["perdere"] = "gara";
  keywordsToSymbols["vittoria"] = "gara";
  keywordsToSymbols["sconfitta"] = "gara";
  keywordsToSymbols["premio"] = "gara";
  keywordsToSymbols["medaglia"] = "gara";
  keywordsToSymbols["trofeo"] = "gara";
  keywordsToSymbols["avversario"] = "gara";
  keywordsToSymbols["rivale"] = "gara";
  keywordsToSymbols["ciclistica"] = "gara";
  keywordsToSymbols["bicicletta"] = "gara";
  keywordsToSymbols["corsa"] = "gara";
  
  // Converte il testo in minuscolo per una corrispondenza case-insensitive
  const lowercaseDreamText = dreamText.toLowerCase();
  
  // Set per tenere traccia dei simboli unici trovati
  const foundSymbols = new Set<string>();
  
  // Cerca parole chiave nel testo del sogno
  Object.entries(keywordsToSymbols).forEach(([keyword, symbolKey]) => {
    if (lowercaseDreamText.includes(keyword)) {
      foundSymbols.add(symbolKey);
    }
  });
  
  // Se non sono stati trovati simboli, prova a restituire comunque qualcosa di generale
  if (foundSymbols.size === 0) {
    const wordsInDream = lowercaseDreamText.split(/\s+/).filter(w => w.length > 3); // considera solo parole lunghe
    if (wordsInDream.length > 0) {
      // Sceglie una parola significativa dal sogno
      const significantWord = wordsInDream[Math.floor(Math.random() * wordsInDream.length)];
      
      // Crea un simbolo generico basato su questa parola
      return {
        mainSymbols: [{
          symbol: significantWord.charAt(0).toUpperCase() + significantWord.slice(1),
          briefDescription: `Elemento che rappresenta aspetti della tua personalità o situazioni nella tua vita.`
        }]
      };
    }
  }
  
  // Converte i simboli trovati in oggetti con breve descrizione
  const extractedSymbols = Array.from(foundSymbols).map(symbolKey => {
    const symbol = fallbackDreamSymbols[symbolKey];
    return {
      symbol: symbol.symbol,
      briefDescription: symbol.meanings.general.split('.')[0] + '.'
    };
  });
  
  const result: any = {
    mainSymbols: extractedSymbols
  };
  
  // Se richiesto, aggiungi le posizioni dei simboli nel testo
  if (includePositions && extractedSymbols.length > 0) {
    result.symbolPositions = findSymbolPositionsInText(dreamText, extractedSymbols);
  }
  
  return result;
}