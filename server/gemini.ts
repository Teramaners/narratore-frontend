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

export async function generateImageFromDream(dream: string, story: string): Promise<ImageResponse> {
  try {
    // Utilizziamo il modello gemini-1.5-pro-latest per generare la descrizione dell'immagine
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    // Prima creiamo una descrizione dettagliata per l'immagine basata sul sogno
    const imagePrompt = `
      Crea una descrizione dettagliata per un'immagine surreale e artistica che rappresenti questo sogno:
      "${dream}"
      
      Il racconto generato da questo sogno è:
      "${story.slice(0, 300)}..."
      
      La descrizione deve essere molto dettagliata, specifica e visiva, adatta per un generatore di immagini.
      Concentrati su: scena principale, colori, atmosfera, elementi simbolici, stile artistico (come surrealismo, fantasy, impressionismo).
      La descrizione deve essere in inglese per ottenere risultati migliori e lunga circa 100-150 parole.
    `;
    
    const descriptionResult = await model.generateContent(imagePrompt);
    const imageDescription = descriptionResult.response.text().trim();
    
    // Ora utilizziamo Stable Diffusion API per generare l'immagine
    // Note: Per questa demo, genereremo SVG al posto di usare API esterne
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
    
    return { imageUrl };
  } catch (error: any) {
    console.error("Error generating image from dream:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

// Funzione per generare SVG artistico basato sul sogno
function generateSvgImageForDream(dream: string, description: string): string {
  // Creiamo un hash dal sogno per ottenere valori pseudo-casuali ma consistenti
  const hash = createHash('md5').update(dream).digest('hex');
  
  // Estraiamo valori dal hash per generare colori e forme
  const r1 = parseInt(hash.substr(0, 2), 16);
  const g1 = parseInt(hash.substr(2, 2), 16);
  const b1 = parseInt(hash.substr(4, 2), 16);
  const r2 = parseInt(hash.substr(6, 2), 16);
  const g2 = parseInt(hash.substr(8, 2), 16);
  const b2 = parseInt(hash.substr(10, 2), 16);
  
  const color1 = `rgb(${r1}, ${g1}, ${b1})`;
  const color2 = `rgb(${r2}, ${g2}, ${b2})`;
  
  // Generiamo formes e percorsi casuali basati sul hash
  const elements = [];
  for (let i = 0; i < 5; i++) {
    const x = parseInt(hash.substr(i*2, 2), 16) % 300;
    const y = parseInt(hash.substr(i*2+1, 2), 16) % 300;
    const radius = (parseInt(hash.substr(i*4, 2), 16) % 50) + 20;
    
    elements.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="rgba(${r1}, ${g1}, ${b1}, 0.5)" />`);
  }
  
  // Aggiungiamo alcune curve Bézier per un effetto artistico
  for (let i = 0; i < 3; i++) {
    const x1 = parseInt(hash.substr(i*2, 2), 16) % 300;
    const y1 = parseInt(hash.substr(i*2+1, 2), 16) % 300;
    const x2 = parseInt(hash.substr(i*2+2, 2), 16) % 300;
    const y2 = parseInt(hash.substr(i*2+3, 2), 16) % 300;
    const x3 = parseInt(hash.substr(i*2+4, 2), 16) % 300;
    const y3 = parseInt(hash.substr(i*2+5, 2), 16) % 300;
    
    elements.push(`<path d="M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3}" stroke="rgba(${r2}, ${g2}, ${b2}, 0.7)" stroke-width="3" fill="none" />`);
  }
  
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <defs>
        <linearGradient id="dreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#dreamGradient)" />
      ${elements.join('\n')}
      <text x="50%" y="95%" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Sogno illustrato con IA</text>
    </svg>
  `;
}