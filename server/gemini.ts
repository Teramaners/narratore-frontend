import { GoogleGenerativeAI } from '@google/generative-ai';

// Inizializza il client Google Generative AI con l'API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");

interface StoryResponse {
  story: string;
}

export interface DreamInterpretationResponse {
  interpretation: string;
  symbolism: string;
  insight: string;
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

export async function interpretDream(dream: string): Promise<DreamInterpretationResponse> {
  try {
    // Utilizza il modello gemini-1.5-pro-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Sistema prompt per l'interpretazione dei sogni
    const systemPrompt = `
    Sei un esperto di psicologia dei sogni che fornisce interpretazioni profonde e significative.
    Analizza il seguente sogno e restituisci tre tipi di informazioni separate in formato JSON:
    
    1. Una interpretazione generale del sogno che spiega i possibili significati in modo chiaro.
    2. Un'analisi dei simboli presenti nel sogno e il loro significato nel contesto culturale e psicologico.
    3. Un approfondimento psicologico che colleghi i temi del sogno alla vita della persona.
    
    Mantieni un tono professionale ma accessibile, evitando sia un linguaggio troppo tecnico sia eccessivamente new age.
    Sii rispettoso della persona e offri diverse prospettive di interpretazione senza imporre una singola verità.
    
    Rispondi in italiano con il seguente formato JSON:
    {
      "interpretation": "interpretazione generale del sogno...",
      "symbolism": "analisi dei simboli presenti nel sogno...",
      "insight": "approfondimento psicologico sul sogno..."
    }
    `;

    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      `Ecco il sogno da interpretare: "${dream}"`
    ]);
    
    const response = result.response;
    const text = response.text();
    
    try {
      // Tenta di analizzare la risposta come JSON
      const parsedResponse = JSON.parse(text);
      
      // Verifica che la risposta contenga i campi necessari
      if (!parsedResponse.interpretation || !parsedResponse.symbolism || !parsedResponse.insight) {
        throw new Error('La risposta non contiene tutti i campi necessari');
      }
      
      return {
        interpretation: parsedResponse.interpretation,
        symbolism: parsedResponse.symbolism,
        insight: parsedResponse.insight
      };
    } catch (error) {
      console.error('Errore nel parsing della risposta JSON:', error);
      
      // Fallback: cerca di estrarre le informazioni dal testo generato
      // Dividi il testo in tre parti (interpretazione, simbolismo, approfondimento)
      const sections = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(s => s.trim().length > 0);
      
      let interpretation = 'Non è stato possibile generare un\'interpretazione. Riprova più tardi.';
      let symbolism = 'Non è stato possibile identificare i simboli. Riprova più tardi.';
      let insight = 'Non è stato possibile generare un approfondimento. Riprova più tardi.';
      
      if (sections.length >= 3) {
        interpretation = sections[0];
        symbolism = sections[1];
        insight = sections[2];
      } else if (sections.length === 2) {
        interpretation = sections[0];
        symbolism = sections[1];
      } else if (sections.length === 1) {
        interpretation = sections[0];
      }
      
      return {
        interpretation,
        symbolism,
        insight
      };
    }
  } catch (error: any) {
    console.error('Errore nella richiesta a Gemini:', error);
    throw new Error('Errore nell\'interpretazione del sogno. Si prega di riprovare più tardi.');
  }
}