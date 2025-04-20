import { GoogleGenerativeAI } from '@google/generative-ai';

// Inizializza il client Google Generative AI con l'API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");

interface StoryResponse {
  story: string;
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