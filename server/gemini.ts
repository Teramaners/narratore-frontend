import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Inizializza il client Google Generative AI con l'API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");

interface StoryResponse {
  story: string;
}

interface EmojiResponse {
  emojiTranslation: string;
}

interface ImageResponse {
  imageUrl: string;
  description?: string; // Descrizione dettagliata dell'immagine generata
}

export interface EmotionData {
  name: string;
  intensity: number;
  description: string;
  color: string;
}

export interface SentimentAnalysisResponse {
  primaryEmotion: string;
  emotions: EmotionData[];
  analysis: string;
}

export async function generateStoryFromDream(dream: string): Promise<StoryResponse> {
  try {
    // Utilizza il modello gemini-1.5-pro-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Sistema prompt per la generazione di storie dai sogni
    const systemPrompt = "Sei 'Narratore di Sogni', un esperto narratore letterario. Il tuo compito è trasformare la descrizione di un sogno dell'utente in un bellissimo racconto letterario breve. Segui queste linee guida: 1) Mantieni gli elementi e le immagini principali del sogno, 2) Aggiungi struttura letteraria, personaggi e flusso narrativo, 3) Usa descrizioni vivide e linguaggio elegante, 4) Crea un chiaro inizio, sviluppo e conclusione, 5) Aggiungi un titolo creativo all'inizio. Il tono deve essere mistico, evocativo e onirico. La lunghezza massima deve essere di circa 500-600 parole.";

    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      dream
    ]);
    
    const response = result.response;
    const text = response.text();

    return { story: text };
  } catch (error: any) {
    throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
  }
}

export async function generateEmojiTranslation(dream: string): Promise<EmojiResponse> {
  try {
    // Utilizza il modello gemini-1.5-pro-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Sistema prompt per la generazione di emoji dai sogni
    const systemPrompt = "Sei 'Traduttore di Sogni in Emoji', un esperto in trasformare i sogni in sequenze di emoji significative e personalizzate. Il tuo compito è prendere la descrizione del sogno dell'utente e creare una traduzione in emoji che catturi l'essenza, le emozioni e i simboli principali del sogno. Segui queste linee guida: 1) Analizza gli elementi principali del sogno, 2) Seleziona emoji che rappresentino sia gli elementi concreti che le emozioni del sogno, 3) Crea una sequenza di 8-15 emoji che racconti il sogno in modo visivo, 4) Assicurati che le emoji siano in un ordine logico che rifletta la narrazione del sogno, 5) Includi sempre emoji che catturino il tono emotivo del sogno. Restituisci SOLO la sequenza di emoji, niente testo o spiegazioni.";

    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      dream
    ]);
    
    const response = result.response;
    const emojiText = response.text().trim();

    return { emojiTranslation: emojiText };
  } catch (error: any) {
    throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
  }
}

export async function analyzeEmotionsInDream(dream: string, story: string): Promise<SentimentAnalysisResponse> {
  try {
    // Utilizza il modello gemini-1.5-pro-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Prompt per l'analisi delle emozioni
    const prompt = `
    Sei uno psicologo esperto nell'analisi delle emozioni nei sogni.
    
    Ecco un sogno e il racconto elaborato:
    
    Sogno originale: "${dream}"
    
    Racconto elaborato: "${story}"
    
    Esegui un'analisi emotiva dettagliata e restituisci il risultato in formato JSON con la seguente struttura:
    
    {
      "primaryEmotion": "Nome dell'emozione principale rilevata",
      "emotions": [
        {
          "name": "Nome dell'emozione",
          "intensity": numeroDa0a10,
          "description": "Breve descrizione di come quest'emozione si manifesta nel sogno",
          "color": "Codice colore esadecimale che rappresenta questa emozione"
        },
        ...
      ],
      "analysis": "Breve analisi (3-4 frasi) delle emozioni complesse presenti nel sogno"
    }
    
    Note:
    1. Identifica almeno 3-5 emozioni diverse presenti nel sogno
    2. Assegna a ciascuna un'intensità compresa tra 0 e 10
    3. Per i colori, usa codici esadecimali che riflettano l'emozione:
       - Felicità/Gioia: tonalità di giallo e arancione (#FFD700, #FFA500, ecc.)
       - Tristezza: tonalità di blu (#4682B4, #1E90FF, ecc.)
       - Paura: tonalità di viola scuro o grigio (#4B0082, #708090, ecc.)
       - Rabbia: tonalità di rosso (#FF0000, #8B0000, ecc.)
       - Sorpresa: tonalità di verde chiaro o turchese (#00FA9A, #00CED1, ecc.)
       - Disgusto: tonalità di verde oliva o marrone (#556B2F, #8B4513, ecc.)
       - Calma/Serenità: tonalità di azzurro chiaro (#B0E0E6, #87CEEB, ecc.)
       - Confusione: tonalità di lavanda o indaco (#E6E6FA, #6A5ACD, ecc.)
       - Nostalgia: tonalità di rosa o pesca (#FFC0CB, #FFDAB9, ecc.)
    
    I nomi delle emozioni devono essere in italiano.
    Le descrizioni devono essere in italiano.
    
    Restituisci solo il JSON valido, senza alcun altro testo o spiegazione.
    `;

    // Genera il contenuto
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Cerca di estrarre il JSON dalla risposta (potrebbe essere circondato da backtick o altro)
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim();
    }

    // Parsa il JSON
    try {
      const emotionsData = JSON.parse(jsonText);
      
      // Validazione basilare
      if (!emotionsData.primaryEmotion || !Array.isArray(emotionsData.emotions) || !emotionsData.analysis) {
        throw new Error('Il formato della risposta JSON non è corretto');
      }
      
      // Normalizza i dati di intensità per assicurarsi che siano numeri
      emotionsData.emotions = emotionsData.emotions.map((emotion: any) => ({
        ...emotion,
        intensity: typeof emotion.intensity === 'string' 
          ? parseFloat(emotion.intensity) 
          : emotion.intensity
      }));
      
      return emotionsData;
    } catch (jsonError) {
      console.error('Errore nel parsing JSON:', jsonError, 'Testo ricevuto:', jsonText);
      throw new Error('Impossibile interpretare la risposta come JSON valido');
    }
  } catch (error: any) {
    console.error('Errore nell\'analisi delle emozioni:', error);
    throw new Error(`Errore nell'analisi delle emozioni: ${error?.message || 'Errore sconosciuto'}`);
  }
}

export interface ArtStyle {
  name: string;
  description: string;
  promptModifier: string;
}

// Definiamo gli stili artistici disponibili
export const artStyles: ArtStyle[] = [
  {
    name: "surrealista",
    description: "Uno stile che combina elementi onirici e simbolici in composizioni inaspettate",
    promptModifier: "in uno stile surrealista, come un dipinto di Salvador Dalí, con elementi distorti e simbolici che sfidano la realtà"
  },
  {
    name: "impressionista",
    description: "Uno stile che cattura la luce e l'atmosfera con pennellate visibili e colori vibranti",
    promptModifier: "in uno stile impressionista, come un dipinto di Claude Monet, con pennellate visibili e colori vibranti che catturano la luce e l'atmosfera"
  },
  {
    name: "fantasy",
    description: "Uno stile che evoca mondi magici con elementi fantastici e colori intensi",
    promptModifier: "in uno stile fantasy, con elementi magici, creature mitologiche e paesaggi impossibili"
  },
  {
    name: "noir",
    description: "Uno stile drammatico con contrasti forti tra luci e ombre",
    promptModifier: "in uno stile noir, con forti contrasti chiaroscuro, atmosfera misteriosa e tonalità scure"
  },
  {
    name: "minimalista",
    description: "Uno stile semplice ed essenziale che si concentra solo sugli elementi più importanti",
    promptModifier: "in uno stile minimalista, con forme semplici, pochi elementi e colori limitati"
  }
];

export async function generateImageFromDream(
  dream: string, 
  story: string, 
  artStyle: string = "surrealista"
): Promise<ImageResponse> {
  try {
    // Utilizziamo il modello gemini-1.5-pro-latest per generare la descrizione dell'immagine
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    // Troviamo lo stile artistico richiesto o usiamo surrealista come default
    const selectedStyle = artStyles.find(style => style.name === artStyle) || artStyles[0];
    
    // Prima creiamo una descrizione dettagliata per l'immagine basata sul sogno
    const imagePrompt = `
      Crea una descrizione dettagliata per un'immagine artistica che rappresenti questo sogno:
      "${dream}"
      
      Il racconto generato da questo sogno è:
      "${story.slice(0, 300)}..."
      
      La descrizione deve essere molto dettagliata, specifica e visiva, ${selectedStyle.promptModifier}.
      
      Concentrati su:
      - Scena principale e personaggi/elementi chiave
      - Palette di colori e atmosfera
      - Elementi simbolici che rappresentano le emozioni o i temi del sogno
      - Illuminazione e composizione
      - Elementi surreali, metaforici o simbolici che catturano l'essenza onirica
      
      La descrizione deve essere in italiano e lunga circa 150-200 parole.
    `;
    
    const descriptionResult = await model.generateContent(imagePrompt);
    const imageDescription = descriptionResult.response.text().trim();
    
    // Ora generiamo l'SVG con il nostro generatore potenziato
    const svgImage = generateSvgImageForDream(dream, imageDescription);
    
    // Creiamo un ID univoco per l'immagine
    const imageId = uuidv4();
    const imageUrl = `/api/dream-images/${imageId}.svg`;
    
    // Salviamo l'SVG in una directory pubblica
    const imagesDir = path.resolve('./public/dream-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(imagesDir, `${imageId}.svg`), svgImage);
    
    return { 
      imageUrl,
      description: imageDescription // Restituiamo anche la descrizione per eventuali utilizzi sul frontend
    };
  } catch (error: any) {
    console.error("Error generating image from dream:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

// Funzione migliorata per generare SVG artistico basato sul sogno
function generateSvgImageForDream(dream: string, description: string): string {
  // Creiamo un hash dal sogno e dalla descrizione per ottenere valori pseudo-casuali ma consistenti
  const hash = createHash('md5').update(dream + description).digest('hex');
  
  // Estraiamo tonalità di colore dal hash
  const hue1 = parseInt(hash.substr(0, 2), 16) % 360;  // Tonalità primaria
  const hue2 = (hue1 + 40 + parseInt(hash.substr(2, 2), 16) % 80) % 360;  // Tonalità complementare
  const sat1 = 60 + parseInt(hash.substr(4, 2), 16) % 40;  // Saturazione
  const sat2 = 50 + parseInt(hash.substr(6, 2), 16) % 50;
  const light1 = 40 + parseInt(hash.substr(8, 2), 16) % 30;  // Luminosità
  const light2 = 30 + parseInt(hash.substr(10, 2), 16) % 40;
  
  // Ricaviamo temi emotivi dalle parole chiave
  const darkTheme = description.toLowerCase().includes('oscuro') || 
                   description.toLowerCase().includes('horror') || 
                   description.toLowerCase().includes('paura') ||
                   description.toLowerCase().includes('terrore') ||
                   description.toLowerCase().includes('inquietante');
  
  const brightTheme = description.toLowerCase().includes('luminoso') || 
                     description.toLowerCase().includes('felice') || 
                     description.toLowerCase().includes('gioia') ||
                     description.toLowerCase().includes('luce') ||
                     description.toLowerCase().includes('brillante');
  
  // Adattiamo i colori in base al tema
  let colorScheme;
  if (darkTheme) {
    colorScheme = {
      bg: `hsl(${hue1}, ${sat1}%, ${Math.max(5, light1 - 30)}%)`,
      main: `hsl(${hue1}, ${sat1}%, ${Math.max(15, light1 - 15)}%)`,
      accent: `hsl(${hue2}, ${sat2}%, ${Math.max(20, light2 - 10)}%)`,
      highlight: `hsl(${(hue1 + 180) % 360}, ${Math.min(100, sat1 + 20)}%, ${Math.min(70, light1 + 30)}%)`,
      textColor: 'rgba(255, 255, 255, 0.9)'
    };
  } else if (brightTheme) {
    colorScheme = {
      bg: `hsl(${hue1}, ${Math.max(20, sat1 - 30)}%, ${Math.min(95, light1 + 30)}%)`,
      main: `hsl(${hue1}, ${sat1}%, ${Math.min(90, light1 + 15)}%)`,
      accent: `hsl(${hue2}, ${sat2}%, ${Math.min(85, light2 + 10)}%)`,
      highlight: `hsl(${hue2}, ${Math.min(100, sat2 + 30)}%, ${Math.max(40, light2)}%)`,
      textColor: 'rgba(0, 0, 0, 0.8)'
    };
  } else {
    // Tema neutro
    colorScheme = {
      bg: `hsl(${hue1}, ${sat1}%, ${light1}%)`,
      main: `hsl(${hue1}, ${sat1 + 10}%, ${light1 - 10}%)`,
      accent: `hsl(${hue2}, ${sat2}%, ${light2}%)`,
      highlight: `hsl(${(hue1 + 60) % 360}, ${Math.min(100, sat1 + 20)}%, ${Math.min(90, light1 + 20)}%)`,
      textColor: light1 > 50 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'
    };
  }
  
  // Generiamo un set di elementi SVG più complessi

  // Funzione per generare una curva path SVG più complessa
  const generateComplexPath = (seed: string, complexity: number, closed = false) => {
    const points = [];
    const center = {
      x: 200 + parseInt(seed.substr(0, 2), 16) % 60 - 30,
      y: 200 + parseInt(seed.substr(2, 2), 16) % 60 - 30
    };
    const radius = 80 + parseInt(seed.substr(4, 2), 16) % 40;
    
    for (let i = 0; i < complexity; i++) {
      const angle = (i / complexity) * Math.PI * 2;
      const variance = parseInt(seed.substr(i * 2 % seed.length, 2), 16) % 40 - 20;
      const r = radius + variance;
      points.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r
      });
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const nextPoint = points[(i + 1) % points.length];
      
      // Controlliamo i punti
      const control1 = {
        x: prevPoint.x + (currentPoint.x - prevPoint.x) / 2,
        y: prevPoint.y + (currentPoint.y - prevPoint.y) / 2
      };
      const control2 = {
        x: currentPoint.x + (nextPoint.x - currentPoint.x) / 2,
        y: currentPoint.y + (nextPoint.y - currentPoint.y) / 2
      };
      
      path += ` S ${control2.x} ${control2.y}, ${nextPoint.x} ${nextPoint.y}`;
    }
    
    if (closed) {
      path += ' Z';
    }
    
    return path;
  };
  
  // Generiamo elementi in base alla descrizione
  const elements = [];
  
  // Sfondo con gradiente
  elements.push(`
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorScheme.bg}" />
        <stop offset="100%" stop-color="${colorScheme.main}" />
      </linearGradient>
      <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
      </filter>
      <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bgGradient)" />
  `);
  
  // Aggiungiamo forme organiche per lo sfondo
  for (let i = 0; i < 3; i++) {
    const seed = hash.substr(i * 6, 6);
    const path = generateComplexPath(seed, 8, true);
    const opacity = 0.2 + (parseInt(seed.substr(0, 2), 16) % 40) / 100;
    elements.push(`
      <path d="${path}" fill="${colorScheme.accent}" opacity="${opacity}" filter="url(#blur1)" />
    `);
  }
  
  // Aggiungiamo forme principali
  for (let i = 0; i < 2; i++) {
    const seed = hash.substr(i * 8 + 2, 8);
    const path = generateComplexPath(seed, 10, true);
    const opacity = 0.5 + (parseInt(seed.substr(0, 2), 16) % 40) / 100;
    elements.push(`
      <path d="${path}" fill="${colorScheme.highlight}" opacity="${opacity}" filter="url(#blur2)" />
    `);
  }
  
  // Aggiungiamo elementi di dettaglio
  for (let i = 0; i < 4; i++) {
    const seed = hash.substr(i * 4 + 10, 8);
    const x = parseInt(seed.substr(0, 2), 16) % 350 + 25;
    const y = parseInt(seed.substr(2, 2), 16) % 350 + 25;
    const radius = 5 + parseInt(seed.substr(4, 2), 16) % 15;
    
    elements.push(`
      <circle cx="${x}" cy="${y}" r="${radius}" fill="${colorScheme.highlight}" opacity="0.8" filter="url(#glow)" />
    `);
  }
  
  // Aggiungiamo linee decorative
  for (let i = 0; i < 5; i++) {
    const seed = hash.substr(i * 6 + 3, 6);
    const x1 = parseInt(seed.substr(0, 2), 16) % 400;
    const y1 = parseInt(seed.substr(2, 2), 16) % 400;
    const x2 = (x1 + parseInt(seed.substr(4, 2), 16) % 100) % 400;
    const y2 = (y1 + parseInt(seed.substr(5, 2), 16) % 100) % 400;
    
    elements.push(`
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colorScheme.highlight}" 
            stroke-width="1" opacity="0.6" stroke-linecap="round" />
    `);
  }
  
  // Elemento centrale simbolico
  const centerPath = generateComplexPath(hash.substr(20, 10), 12, true);
  elements.push(`
    <path d="${centerPath}" fill="${colorScheme.highlight}" opacity="0.7" filter="url(#glow)" />
  `);
  
  // Aggiungiamo un titolo
  elements.push(`
    <text x="50%" y="95%" font-family="Arial" font-size="14" fill="${colorScheme.textColor}" 
          text-anchor="middle" font-weight="bold" filter="url(#glow)">
      Visione Onirica
    </text>
  `);
  
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      ${elements.join('\n')}
    </svg>
  `;
}