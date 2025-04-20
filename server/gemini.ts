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

interface EmojiExplanation {
  emoji: string;
  meaning: string; // Significato dell'emoji nel contesto del sogno
}

interface EmojiResponse {
  emojiTranslation: string;
  emojiExplanations?: EmojiExplanation[];
  emojiMood?: string; // Tono emotivo generale della sequenza
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
    // Utilizza il modello gemini-1.5-pro-latest per generare sequenza di emoji
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Sistema prompt per la generazione di emoji dai sogni con spiegazioni
    const systemPrompt = `Sei 'Traduttore di Sogni in Emoji', un esperto in trasformare i sogni in sequenze di emoji significative e personalizzate.

Il tuo compito è prendere la descrizione del sogno dell'utente e creare:
1. Una sequenza di 8-15 emoji che racconti il sogno in modo visivo
2. Una spiegazione concisa per ciascuna emoji scelta
3. Un'interpretazione generale del tono emotivo della sequenza

Segui queste linee guida:
- Analizza attentamente gli elementi principali e le emozioni del sogno
- Seleziona emoji che rappresentino sia gli elementi concreti che i temi astratti
- Assicurati che le emoji siano in un ordine logico che rifletta la narrazione del sogno
- Aggiungi emoji che catturino il tono emotivo generale
- Spiega in modo semplice perché hai scelto ciascuna emoji e cosa rappresenta nel contesto

Restituisci la risposta in formato JSON con questa struttura:
{
  "emojiTranslation": "🌊🏄‍♂️🌪️🏝️👨‍👩‍👧‍👦🌅",
  "emojiExplanations": [
    {
      "emoji": "🌊",
      "meaning": "Rappresenta l'oceano nel sogno e simboleggia l'inconscio o le emozioni profonde"
    },
    // altre spiegazioni emoji
  ],
  "emojiMood": "Questo sogno ha un tono prevalentemente [avventuroso/pacifica/inquietante/ecc] con elementi di [emozione]"
}
`;

    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      dream
    ]);
    
    const response = result.response;
    const responseText = response.text().trim();

    // Estrai il JSON dalla risposta (potrebbe essere circondato da backtick o altro)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim();
    }

    try {
      // Parsa il JSON
      const emojiData = JSON.parse(jsonText);
      
      // Validazione basilare
      if (!emojiData.emojiTranslation) {
        // Fallback nel caso il formato JSON non sia rispettato
        return { emojiTranslation: responseText.replace(/[*_`]|```json|```/g, '').trim() };
      }
      
      return {
        emojiTranslation: emojiData.emojiTranslation,
        emojiExplanations: emojiData.emojiExplanations || [],
        emojiMood: emojiData.emojiMood
      };
    } catch (jsonError) {
      console.error('Errore nel parsing JSON delle emoji:', jsonError, 'Testo ricevuto:', jsonText);
      
      // Fallback: invece di cercare di estrarre le emoji (che può essere complicato),
      // usiamo un metodo più diretto e restituiamo una risposta predefinita
      return { 
        emojiTranslation: '🤔✨🌙💭' 
      };
    }
  } catch (error: any) {
    console.error("Error generating emoji translation:", error);
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
    const svgImage = generateSvgImageForDream(dream, imageDescription, artStyle);
    
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

// Funzione completamente riscritta per generare SVG artistico basato sul sogno
function generateSvgImageForDream(dream: string, description: string, artStyle: string = "surrealista"): string {
  // Creiamo un hash dal sogno e dalla descrizione per ottenere valori pseudo-casuali ma consistenti
  const hash = createHash('md5').update(dream + description).digest('hex');
  
  // Estraiamo tonalità di colore dal hash
  const hue1 = parseInt(hash.substr(0, 2), 16) % 360;  // Tonalità primaria
  const hue2 = (hue1 + 40 + parseInt(hash.substr(2, 2), 16) % 80) % 360;  // Tonalità complementare
  const hue3 = (hue1 + 180) % 360;  // Tonalità opposta
  const sat1 = 60 + parseInt(hash.substr(4, 2), 16) % 40;  // Saturazione
  const sat2 = 50 + parseInt(hash.substr(6, 2), 16) % 50;
  const light1 = 40 + parseInt(hash.substr(8, 2), 16) % 30;  // Luminosità
  const light2 = 30 + parseInt(hash.substr(10, 2), 16) % 40;
  
  // Ricaviamo temi emotivi dalle parole chiave
  const darkTheme = description.toLowerCase().includes('oscuro') || 
                   description.toLowerCase().includes('horror') || 
                   description.toLowerCase().includes('paura') ||
                   description.toLowerCase().includes('terrore') ||
                   description.toLowerCase().includes('inquietante') ||
                   description.toLowerCase().includes('nero') ||
                   description.toLowerCase().includes('ombra');
  
  const brightTheme = description.toLowerCase().includes('luminoso') || 
                     description.toLowerCase().includes('felice') || 
                     description.toLowerCase().includes('gioia') ||
                     description.toLowerCase().includes('luce') ||
                     description.toLowerCase().includes('brillante') ||
                     description.toLowerCase().includes('sole') ||
                     description.toLowerCase().includes('sereno');
                     
  const waterTheme = description.toLowerCase().includes('acqua') || 
                    description.toLowerCase().includes('mare') || 
                    description.toLowerCase().includes('oceano') ||
                    description.toLowerCase().includes('fiume') ||
                    description.toLowerCase().includes('lago');
                    
  const fireTheme = description.toLowerCase().includes('fuoco') || 
                   description.toLowerCase().includes('fiamma') || 
                   description.toLowerCase().includes('caldo') ||
                   description.toLowerCase().includes('bruciare');
                   
  const natureTheme = description.toLowerCase().includes('natura') || 
                     description.toLowerCase().includes('foresta') || 
                     description.toLowerCase().includes('albero') ||
                     description.toLowerCase().includes('verde') ||
                     description.toLowerCase().includes('pianta');
  
  
  // Define SVG element arrays and color schemes for each style
  const elements: string[] = [];
  const defs: string[] = [];
  
  // --------------------------------
  // Definizione degli stili artistici
  // --------------------------------
  
  const styleGenerator = {
    // Stile surrealista
    surrealista: () => {
      // Palette surreale
      const colorScheme = {
        bg: darkTheme 
          ? `hsl(${hue1}, ${sat1}%, ${Math.max(5, light1 - 25)}%)`
          : `hsl(${hue1}, ${sat1}%, ${Math.min(90, light1 + 15)}%)`,
        main: `hsl(${hue2}, ${sat2}%, ${light2}%)`,
        accent1: `hsl(${(hue1 + 120) % 360}, ${Math.min(100, sat1 + 20)}%, ${Math.min(80, light1 + 10)}%)`,
        accent2: `hsl(${(hue1 + 240) % 360}, ${Math.min(100, sat1 + 10)}%, ${Math.min(70, light1 + 5)}%)`,
        highlight: `hsl(${hue2}, ${Math.min(100, sat2 + 30)}%, ${Math.max(45, light2 + 20)}%)`,
        textColor: darkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
      };
      
      // Filtri surreali
      defs.push(`
        <filter id="displacementFilter">
          <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="3" result="turbulence"/>
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="25" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="grainEffect">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.5 0"/>
          <feComposite operator="in" in2="SourceGraphic"/>
          <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" in2="SourceGraphic"/> 
        </filter>
        <radialGradient id="surreal-gradient" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="${colorScheme.accent1}" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="${colorScheme.main}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${colorScheme.bg}" stop-opacity="1"/>
        </radialGradient>
      `);
      
      // Background
      elements.push(`<rect width="100%" height="100%" fill="url(#surreal-gradient)" />`);
      
      // Floating objects (typical surreal elements)
      const generateFloatingObjects = () => {
        const objects = [];
        
        // Occhi fluttuanti (elemento surrealista classico)
        for (let i = 0; i < 3; i++) {
          const seed = hash.substr(i * 8, 8);
          const x = parseInt(seed.substr(0, 2), 16) % 350 + 25;
          const y = parseInt(seed.substr(2, 2), 16) % 350 + 25;
          const size = 10 + parseInt(seed.substr(4, 2), 16) % 25;
          
          objects.push(`
            <g transform="translate(${x}, ${y})" filter="url(#softGlow)">
              <ellipse cx="0" cy="0" rx="${size}" ry="${size * 0.6}" fill="white" />
              <circle cx="0" cy="0" r="${size * 0.4}" fill="${colorScheme.accent2}" />
              <circle cx="0" cy="0" r="${size * 0.2}" fill="black" />
              <circle cx="${size * 0.15}" cy="${-size * 0.15}" r="${size * 0.05}" fill="white" />
            </g>
          `);
        }
        
        // Forme geometriche distorte
        for (let i = 0; i < 2; i++) {
          const seed = hash.substr(i * 6 + 20, 8);
          const x = parseInt(seed.substr(0, 2), 16) % 300 + 50;
          const y = parseInt(seed.substr(2, 2), 16) % 300 + 50;
          const size = 30 + parseInt(seed.substr(4, 2), 16) % 60;
          
          objects.push(`
            <polygon points="${x},${y} ${x + size},${y + size / 2} ${x},${y + size} ${x - size},${y + size / 2}" 
                    fill="${colorScheme.accent1}" opacity="0.7" filter="url(#displacementFilter)" />
          `);
        }
        
        // Orologio sciolto (riferimento a Dalí)
        const clockSeed = hash.substr(14, 10);
        const clockX = parseInt(clockSeed.substr(0, 2), 16) % 300 + 50;
        const clockY = parseInt(clockSeed.substr(2, 2), 16) % 200 + 100;
        const clockRadius = 30 + parseInt(clockSeed.substr(4, 2), 16) % 20;
        
        objects.push(`
          <g transform="translate(${clockX}, ${clockY}) rotate(15)" filter="url(#displacementFilter)">
            <ellipse cx="0" cy="0" rx="${clockRadius}" ry="${clockRadius * 1.5}" fill="${colorScheme.highlight}" 
                    stroke="black" stroke-width="2" opacity="0.9" />
            <line x1="0" y1="-${clockRadius * 0.5}" x2="0" y2="${clockRadius * 0.2}" stroke="black" stroke-width="2" />
            <line x1="-${clockRadius * 0.4}" y1="0" x2="${clockRadius * 0.2}" y2="0" stroke="black" stroke-width="2" />
          </g>
        `);
        
        return objects.join('\n');
      };
      
      // Aggiungiamo elementi surrealisti
      elements.push(generateFloatingObjects());
      
      // Aggiungiamo un motivo di sfondo surreale
      elements.push(`
        <g opacity="0.2" filter="url(#grainEffect)">
          <rect width="100%" height="100%" fill="none" stroke="${colorScheme.accent2}" stroke-width="5" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="${colorScheme.accent1}" stroke-width="3" stroke-dasharray="10,10" />
        </g>
      `);
      
      // Horizon line with reflection (classic surrealist landscape element)
      elements.push(`
        <path d="M 0,300 C 100,280 300,320 400,300" stroke="${colorScheme.accent2}" stroke-width="2" fill="none" />
        <path d="M 0,300 C 100,320 300,280 400,300 L 400,400 L 0,400 Z" fill="${colorScheme.accent2}" opacity="0.3" />
      `);
      
      // Firma surrealista
      elements.push(`
        <text x="50%" y="95%" font-family="cursive" font-size="14" fill="${colorScheme.textColor}" 
              text-anchor="middle" font-style="italic" filter="url(#softGlow)">
          Sogno Surrealista
        </text>
      `);
    },
    
    // Stile impressionista
    impressionista: () => {
      // Palette impressionista - colori vivaci e luminosi
      const colorScheme = {
        bg: `hsl(${hue1}, ${Math.max(60, sat1)}%, ${Math.min(90, light1 + 20)}%)`,
        main: `hsl(${hue2}, ${Math.min(100, sat2 + 10)}%, ${Math.min(80, light2 + 15)}%)`,
        accent1: `hsl(${(hue1 + 30) % 360}, ${Math.min(90, sat1 + 20)}%, ${Math.min(85, light1 + 10)}%)`,
        accent2: `hsl(${(hue1 + 60) % 360}, ${Math.min(100, sat1 + 15)}%, ${Math.min(80, light1 + 5)}%)`,
        shadow: `hsl(${(hue1 + 240) % 360}, ${Math.min(70, sat1)}%, ${Math.max(30, light1 - 20)}%)`,
        highlight: `hsl(${hue1}, ${Math.min(60, sat1)}%, ${Math.min(95, light1 + 25)}%)`,
        textColor: 'rgba(60, 40, 20, 0.9)'
      };
      
      // Filtri impressionisti per effetto pennellata
      defs.push(`
        <filter id="brushStrokes" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="${parseInt(hash.substr(0, 8), 16)}" />
          <feDisplacementMap in="SourceGraphic" scale="20" />
        </filter>
        <filter id="softLight">
          <feGaussianBlur stdDeviation="5" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.7 0"/>
        </filter>
        <pattern id="brushTexture" patternUnits="userSpaceOnUse" width="100" height="100">
          <rect width="100" height="100" fill="${colorScheme.highlight}" opacity="0.1" />
          <g fill="none" stroke="${colorScheme.shadow}" stroke-width="0.5" opacity="0.1">
            ${Array.from({length: 20}, (_, i) => {
              const x1 = Math.floor(Math.random() * 100);
              const y1 = Math.floor(Math.random() * 100);
              const x2 = Math.floor(Math.random() * 100);
              const y2 = Math.floor(Math.random() * 100);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
            }).join('\n')}
          </g>
        </pattern>
      `);
      
      // Sfondo con texture
      elements.push(`
        <rect width="400" height="400" fill="${colorScheme.bg}" />
        <rect width="400" height="400" fill="url(#brushTexture)" />
      `);
      
      // Funzione per generare pennellate impressioniste
      const generateBrushStrokes = () => {
        const strokes = [];
        
        // Primo livello - pennellate di sfondo grandi e ampie
        for (let i = 0; i < 15; i++) {
          const seed = hash.substr(i * 3, 6);
          const x = parseInt(seed.substr(0, 2), 16) % 400;
          const y = parseInt(seed.substr(2, 2), 16) % 400;
          const width = 40 + parseInt(seed.substr(4, 2), 16) % 60;
          const height = 5 + parseInt(seed.substr(5, 1), 16) % 20;
          const rotation = parseInt(seed.substr(1, 2), 16) % 180;
          
          // Colore determinato dalla posizione
          let color;
          if (y < 150) {
            // Cielo - tonalità blu/viola
            color = i % 2 === 0 ? colorScheme.bg : colorScheme.accent1;
          } else if (y < 300) {
            // Terreno centrale - verde/giallo/arancio
            color = i % 2 === 0 ? colorScheme.main : colorScheme.accent2;
          } else {
            // Primo piano - più denso/scuro
            color = i % 2 === 0 ? colorScheme.accent2 : colorScheme.shadow;
          }
          
          strokes.push(`
            <ellipse cx="${x}" cy="${y}" rx="${width}" ry="${height}" 
                    transform="rotate(${rotation}, ${x}, ${y})"
                    fill="${color}" opacity="${0.3 + (i % 4) * 0.1}" filter="url(#brushStrokes)" />
          `);
        }
        
        // Secondo livello - pennellate di dettaglio
        for (let i = 0; i < 40; i++) {
          const seed = hash.substr(i * 2 + 10, 6);
          const x = parseInt(seed.substr(0, 2), 16) % 400;
          const y = parseInt(seed.substr(2, 2), 16) % 400;
          const width = 5 + parseInt(seed.substr(4, 2), 16) % 30;
          const height = 2 + parseInt(seed.substr(5, 1), 16) % 10;
          const rotation = parseInt(seed.substr(1, 2), 16) % 180;
          
          // Mix dinamico di colori
          const colorIndex = i % 5;
          let color;
          switch (colorIndex) {
            case 0: color = colorScheme.bg; break;
            case 1: color = colorScheme.main; break;
            case 2: color = colorScheme.accent1; break;
            case 3: color = colorScheme.accent2; break;
            case 4: color = colorScheme.highlight; break;
          }
          
          strokes.push(`
            <ellipse cx="${x}" cy="${y}" rx="${width}" ry="${height}" 
                    transform="rotate(${rotation}, ${x}, ${y})"
                    fill="${color}" opacity="${0.4 + (i % 5) * 0.1}" filter="url(#brushStrokes)" />
          `);
        }
        
        return strokes.join('\n');
      };
      
      // Aggiungiamo pennellate impressioniste
      elements.push(generateBrushStrokes());
      
      // Aggiungiamo highlights impressionisti (punti di luce)
      for (let i = 0; i < 10; i++) {
        const seed = hash.substr(i * 3 + 20, 6);
        const x = parseInt(seed.substr(0, 2), 16) % 400;
        const y = parseInt(seed.substr(2, 2), 16) % 400;
        const radius = 2 + parseInt(seed.substr(4, 2), 16) % 6;
        
        elements.push(`
          <circle cx="${x}" cy="${y}" r="${radius}" fill="${colorScheme.highlight}" 
                  opacity="0.8" filter="url(#softLight)" />
        `);
      }
      
      // Firma impressionista
      elements.push(`
        <text x="50%" y="95%" font-family="serif" font-size="16" fill="${colorScheme.textColor}" 
              text-anchor="middle" font-weight="normal" filter="url(#softLight)">
          Impression
        </text>
      `);
    },
    
    // Stile fantasy
    fantasy: () => {
      // Palette fantasy - colori intensi e vibranti
      const colorScheme = {
        bg: darkTheme 
          ? `hsl(${(hue1 + 210) % 360}, ${Math.min(80, sat1 + 10)}%, ${Math.max(10, light1 - 20)}%)`
          : `hsl(${(hue1 + 200) % 360}, ${Math.min(80, sat1 + 20)}%, ${Math.min(40, light1 + 10)}%)`,
        main: `hsl(${hue1}, ${Math.min(100, sat1 + 20)}%, ${Math.min(60, light1 + 5)}%)`,
        accent1: `hsl(${(hue1 + 60) % 360}, ${Math.min(100, sat1 + 30)}%, ${Math.min(70, light1 + 15)}%)`,
        accent2: `hsl(${(hue1 + 30) % 360}, ${Math.min(100, sat1 + 25)}%, ${Math.min(65, light1 + 10)}%)`,
        magic: `hsl(${(hue1 + 290) % 360}, ${Math.min(100, sat1 + 40)}%, ${Math.min(75, light1 + 25)}%)`,
        highlight: `hsl(${(hue1 + 180) % 360}, ${Math.min(100, sat1 + 30)}%, ${Math.min(85, light1 + 30)}%)`,
        textColor: 'rgba(255, 255, 255, 0.9)'
      };
      
      // Filtri fantasy
      defs.push(`
        <filter id="magicGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 30 -10
          " result="magicGlow" />
          <feComposite in="SourceGraphic" in2="magicGlow" operator="over" />
        </filter>
        <filter id="starlight">
          <feGaussianBlur stdDeviation="2.5" />
          <feColorMatrix type="matrix" values="
            1 0 0 0 1
            0 1 0 0 1
            0 0 1 0 1
            0 0 0 15 -6
          "/>
        </filter>
        <radialGradient id="fantasy-sky" cx="50%" cy="30%" r="80%" fx="50%" fy="30%">
          <stop offset="0%" stop-color="${colorScheme.highlight}" stop-opacity="0.7"/>
          <stop offset="40%" stop-color="${colorScheme.bg}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${colorScheme.bg}" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="fantasy-ground" x1="0%" y1="60%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorScheme.main}" />
          <stop offset="100%" stop-color="${colorScheme.accent2}" />
        </linearGradient>
      `);
      
      // Cielo fantasy con luna/sole
      elements.push(`
        <rect width="400" height="400" fill="url(#fantasy-sky)" />
        <circle cx="300" cy="100" r="40" fill="${colorScheme.highlight}" opacity="0.9" filter="url(#magicGlow)" />
      `);
      
      // Aggiungiamo stelle
      for (let i = 0; i < 25; i++) {
        const seed = hash.substr(i * 2, 4);
        const x = parseInt(seed.substr(0, 2), 16) % 400;
        const y = parseInt(seed.substr(2, 2), 16) % 200;
        const size = 1 + (parseInt(seed.substr(3, 1), 16) % 3);
        
        elements.push(`
          <circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${0.5 + (size / 4)}" filter="url(#starlight)" />
        `);
      }
      
      // Paesaggio fantasy (montagne, foresta)
      elements.push(`
        <path d="M0,400 L0,300 Q50,200 100,250 Q150,300 200,200 Q250,100 300,180 Q350,260 400,220 L400,400 Z" 
                fill="url(#fantasy-ground)" />
      `);
      
      // Torre fantasy o castello
      const castleX = 100 + parseInt(hash.substr(0, 2), 16) % 200;
      elements.push(`
        <g transform="translate(${castleX}, 280) scale(0.6)">
          <rect x="-25" y="-120" width="50" height="120" fill="${colorScheme.accent1}" />
          <polygon points="-35,-120 35,-120 0,-160" fill="${colorScheme.accent1}" />
          <rect x="-35" y="-45" width="70" height="45" fill="${colorScheme.accent1}" />
          <rect x="-10" y="-10" width="20" height="10" fill="black" />
          <circle cx="0" cy="-80" r="10" fill="${colorScheme.magic}" filter="url(#magicGlow)" />
        </g>
      `);
      
      // Elementi magici (aura, particelle)
      for (let i = 0; i < 15; i++) {
        const seed = hash.substr(i * 3 + 15, 6);
        const x = parseInt(seed.substr(0, 2), 16) % 400;
        const y = 150 + parseInt(seed.substr(2, 2), 16) % 250;
        const size = 2 + parseInt(seed.substr(4, 2), 16) % 8;
        
        elements.push(`
          <circle cx="${x}" cy="${y}" r="${size}" fill="${colorScheme.magic}" 
                  opacity="${0.6 + (size / 20)}" filter="url(#magicGlow)" />
        `);
      }
      
      // Creatura fantasy volante
      const creatureX = 250 + parseInt(hash.substr(10, 2), 16) % 100;
      const creatureY = 100 + parseInt(hash.substr(12, 2), 16) % 50;
      elements.push(`
        <g transform="translate(${creatureX}, ${creatureY}) scale(0.3)" filter="url(#magicGlow)">
          <ellipse cx="0" cy="0" rx="20" ry="10" fill="${colorScheme.accent2}" />
          <path d="M-5,-5 Q0,-20 5,-5 Z" fill="${colorScheme.accent2}" />
          <path d="M-20,0 Q-40,-20 -30,10 Z" fill="${colorScheme.accent2}" />
          <path d="M20,0 Q40,-20 30,10 Z" fill="${colorScheme.accent2}" />
        </g>
      `);
      
      // Title
      elements.push(`
        <text x="50%" y="95%" font-family="fantasy" font-size="18" fill="${colorScheme.textColor}" 
              text-anchor="middle" filter="url(#starlight)">
          Regno Onirico
        </text>
      `);
    },
    
    // Stile noir
    noir: () => {
      // Palette noir - alto contrasto, principalmente bianco e nero
      const colorScheme = {
        bg: 'rgb(10, 10, 12)',
        main: 'rgb(30, 30, 35)',
        shadow: 'rgb(5, 5, 7)',
        highlight: 'rgb(200, 200, 220)',
        accent: `hsla(${hue1}, 20%, 50%, 0.4)`, // Una leggera tinta di colore
        textColor: 'rgba(220, 220, 220, 0.9)'
      };
      
      // Filtri noir
      defs.push(`
        <filter id="noirGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.07 0"/>
          <feComposite operator="in" in2="SourceGraphic"/>
          <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" in2="SourceGraphic"/> 
        </filter>
        <filter id="sharpShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="5" dy="5" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.9 0" />
          <feBlend mode="normal" in2="SourceGraphic" />
        </filter>
        <linearGradient id="noirFade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorScheme.bg}" />
          <stop offset="40%" stop-color="${colorScheme.main}" />
          <stop offset="100%" stop-color="${colorScheme.shadow}" />
        </linearGradient>
        <radialGradient id="spotlight" cx="30%" cy="30%" r="60%" fx="30%" fy="30%">
          <stop offset="0%" stop-color="${colorScheme.highlight}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${colorScheme.bg}" stop-opacity="0"/>
        </radialGradient>
      `);
      
      // Sfondo noir
      elements.push(`
        <rect width="400" height="400" fill="url(#noirFade)" />
        <rect width="400" height="400" fill="url(#spotlight)" />
        <rect width="400" height="400" fill="transparent" filter="url(#noirGrain)" />
      `);
      
      // Elementi urbani (edifici, strade)
      elements.push(`
        <g opacity="0.85">
          <rect x="50" y="150" width="100" height="250" fill="${colorScheme.main}" filter="url(#sharpShadow)" />
          <rect x="250" y="100" width="120" height="300" fill="${colorScheme.main}" filter="url(#sharpShadow)" />
          <rect x="170" y="180" width="60" height="220" fill="${colorScheme.main}" filter="url(#sharpShadow)" />
          
          <!-- Finestre -->
          ${Array.from({length: 20}, (_, i) => {
            const bldg = i % 3;
            let x, y, width, height;
            
            if (bldg === 0) {
              // Primo edificio
              x = 60 + (i % 4) * 20;
              y = 170 + Math.floor(i / 4) * 40;
              width = 10;
              height = 20;
            } else if (bldg === 1) {
              // Edificio centrale
              x = 180 + (i % 2) * 30;
              y = 200 + Math.floor((i % 6) / 2) * 35;
              width = 15;
              height = 25;
            } else {
              // Edificio a destra
              x = 260 + (i % 5) * 20;
              y = 120 + Math.floor(i / 5) * 40;
              width = 12;
              height = 18;
            }
            
            // Luce accesa o spenta
            const lit = hash.charAt(i).charCodeAt(0) % 5 === 0;
            const fill = lit ? 'rgba(255, 240, 180, 0.7)' : 'rgba(30, 30, 35, 0.8)';
            
            return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
          }).join('\n')}
        </g>
      `);
      
      // Luci della strada
      elements.push(`
        <circle cx="80" cy="140" r="40" fill="${colorScheme.highlight}" opacity="0.05" />
        <circle cx="80" cy="140" r="5" fill="${colorScheme.highlight}" opacity="0.8" />
        <rect x="78" y="140" width="4" height="40" fill="${colorScheme.main}" />
      `);
      
      // Silhouette di persona
      elements.push(`
        <g transform="translate(120, 340) scale(0.8)">
          <path d="M0,0 L0,-30 L5,-35 L-5,-35 L0,-30 L-10,-20 L10,-20 Z" fill="black" />
          <line x1="0" y1="-30" x2="0" y2="-60" stroke="black" stroke-width="2" />
          <circle cx="0" cy="-70" r="10" fill="black" />
        </g>
      `);
      
      // Elementi noir (sigaretta, ombra lunga)
      const shadowLength = 150 + parseInt(hash.substr(0, 2), 16) % 100;
      elements.push(`
        <g transform="translate(350, 350)">
          <path d="M0,0 L-${shadowLength},-${shadowLength / 3}" stroke="${colorScheme.shadow}" stroke-width="20" stroke-opacity="0.15" />
        </g>
      `);
      
      // Effect rain (pioggia tipica del noir)
      for (let i = 0; i < 30; i++) {
        const seed = hash.substr(i * 2, 4);
        const x = parseInt(seed.substr(0, 2), 16) % 400;
        const y = parseInt(seed.substr(2, 2), 16) % 400;
        const length = 10 + parseInt(seed.substr(3, 1), 16) % 15;
        
        elements.push(`
          <line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + length}" 
                stroke="${colorScheme.highlight}" stroke-width="1" opacity="0.3" />
        `);
      }
      
      // Title
      elements.push(`
        <text x="50%" y="95%" font-family="monospace" font-size="16" fill="${colorScheme.textColor}" 
              text-anchor="middle" letter-spacing="3">
          NOIR
        </text>
      `);
    },
    
    // Stile minimalista
    minimalista: () => {
      // Palette minimalista - colori limitati e semplici
      const colorScheme = {
        bg: `hsl(${hue1}, 10%, 95%)`, // Sfondo quasi bianco
        main: `hsl(${hue1}, 50%, 50%)`, // Il colore principale (usato con moderazione)
        accent: `hsl(${(hue1 + 180) % 360}, 40%, 60%)`, // Accento (usato ancora meno)
        dark: `hsl(${hue1}, 10%, 15%)`, // Quasi nero
        light: `hsl(${hue1}, 5%, 98%)`, // Quasi bianco
        textColor: `hsl(${hue1}, 10%, 15%)`
      };
      
      // Per uno stile veramente minimalista, non utilizziamo molti filtri
      defs.push(`
        <filter id="minimalBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      `);
      
      // Sfondo minimalista
      elements.push(`<rect width="400" height="400" fill="${colorScheme.bg}" />`);
      
      // Uno o due elementi geometrici semplici che dominano la composizione
      const useCircle = parseInt(hash.substr(0, 2), 16) % 2 === 0;
      
      if (useCircle) {
        // Composizione con cerchio
        const cx = 200 + parseInt(hash.substr(2, 2), 16) % 40 - 20;
        const cy = 200 + parseInt(hash.substr(4, 2), 16) % 40 - 20;
        const r = 80 + parseInt(hash.substr(6, 2), 16) % 40;
        
        elements.push(`
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colorScheme.main}" opacity="0.8" />
          <circle cx="${cx + r/2}" cy="${cy - r/2}" r="${r/3}" fill="${colorScheme.accent}" opacity="0.6" />
        `);
      } else {
        // Composizione con rettangolo
        const x = 100 + parseInt(hash.substr(2, 2), 16) % 40 - 20;
        const y = 100 + parseInt(hash.substr(4, 2), 16) % 40 - 20;
        const width = 200 + parseInt(hash.substr(6, 2), 16) % 40 - 20;
        const height = 200 + parseInt(hash.substr(8, 2), 16) % 40 - 20;
        
        elements.push(`
          <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colorScheme.main}" opacity="0.8" />
          <rect x="${x + width/2}" y="${y - height/4}" width="${width/4}" height="${height/4}" fill="${colorScheme.accent}" opacity="0.6" />
        `);
      }
      
      // Una singola linea che attraversa la composizione
      const lineVertical = parseInt(hash.substr(10, 2), 16) % 2 === 0;
      
      if (lineVertical) {
        const x = 150 + parseInt(hash.substr(12, 2), 16) % 100;
        elements.push(`
          <line x1="${x}" y1="0" x2="${x}" y2="400" stroke="${colorScheme.dark}" stroke-width="1" opacity="0.5" />
        `);
      } else {
        const y = 150 + parseInt(hash.substr(12, 2), 16) % 100;
        elements.push(`
          <line x1="0" y1="${y}" x2="400" y2="${y}" stroke="${colorScheme.dark}" stroke-width="1" opacity="0.5" />
        `);
      }
      
      // Un tocco personale al design - nome essenziale
      elements.push(`
        <text x="50%" y="95%" font-family="sans-serif" font-size="12" fill="${colorScheme.textColor}" 
              text-anchor="middle" letter-spacing="5">
          minimo
        </text>
      `);
    }
  };
  
  // Determine which style to use
  if (!artStyles.find(style => style.name === artStyle)) {
    artStyle = "surrealista"; // Default to surrealist if style not found
  }
  
  // Generate the style
  styleGenerator[artStyle]();
  
  // Compose the final SVG
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${defs.join('\n')}
      </defs>
      ${elements.join('\n')}
    </svg>
  `;
}