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
export function getFallbackExtractedSymbols(dreamText: string) {
  // Lista di parole chiave da cercare nel testo del sogno
  const keywordsToSymbols: {[key: string]: string} = {
    "acqua": "acqua",
    "mare": "acqua",
    "oceano": "acqua",
    "lago": "acqua",
    "fiume": "acqua",
    "pioggia": "acqua",
    
    "volare": "volare",
    "volo": "volare",
    "ali": "volare",
    "cielo": "volare",
    
    "casa": "casa",
    "appartamento": "casa",
    "edificio": "casa",
    "stanza": "casa",
    
    "cadere": "cadere",
    "caduta": "cadere",
    "precipitare": "cadere",
    
    "denti": "denti",
    "dente": "denti",
    "bocca": "denti",
    
    "serpente": "serpente",
    "serpenti": "serpente",
    "rettile": "serpente",
    
    "inseguire": "inseguimento",
    "inseguito": "inseguimento",
    "rincorrere": "inseguimento",
    "fuggire": "inseguimento",
    
    "bambino": "bambino",
    "bambina": "bambino",
    "neonato": "bambino",
    "infante": "bambino"
  };
  
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
  
  // Converte i simboli trovati in oggetti con breve descrizione
  const extractedSymbols = Array.from(foundSymbols).map(symbolKey => {
    const symbol = fallbackDreamSymbols[symbolKey];
    return {
      symbol: symbol.symbol,
      briefDescription: symbol.meanings.general.split('.')[0] + '.'
    };
  });
  
  return {
    mainSymbols: extractedSymbols
  };
}