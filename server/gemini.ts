import { GoogleGenerativeAI } from '@google/generative-ai';

// Inizializza il client Google Generative AI con l'API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");

interface StoryResponse {
  story: string;
}

interface EmojiResponse {
  emojiTranslation: string;
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