import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DreamInterpretationResponse {
  interpretation: string;
  symbolism: string;
  insight: string;
}

export async function interpretDream(dream: string): Promise<DreamInterpretationResponse> {
  try {
    const systemPrompt = `Sei un esperto di psicologia dei sogni che fornisce interpretazioni profonde e significative.
    Analizza il sogno fornito dall'utente e restituisci tre tipi di informazioni:
    
    1. Una interpretazione generale del sogno che spiega i possibili significati in modo chiaro.
    2. Un'analisi dei simboli presenti nel sogno e il loro significato nel contesto culturale e psicologico.
    3. Un approfondimento psicologico che colleghi i temi del sogno alla vita dell'utente.
    
    Mantieni un tono professionale ma accessibile, evitando sia un linguaggio troppo tecnico sia eccessivamente new age.
    Sii rispettoso della persona e offri diverse prospettive di interpretazione senza imporre una singola verità.
    
    Rispondi in italiano con una struttura JSON come questa:
    {
      "interpretation": "interpretazione generale del sogno...",
      "symbolism": "analisi dei simboli presenti nel sogno...",
      "insight": "approfondimento psicologico sul sogno..."
    }
    `;

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Ecco il mio sogno, puoi interpretarlo? "${dream}"` }
      ],
      temperature: 0.7,
    });

    // Estrai il contenuto della risposta
    const contentBlock = message.content[0];
    // Verifica che il blocco di contenuto sia di tipo testo
    if (contentBlock.type !== 'text') {
      throw new Error('La risposta non contiene testo');
    }
    const responseText = contentBlock.text;
    
    try {
      // Tenta di analizzare la risposta come JSON
      const parsedResponse = JSON.parse(responseText);
      
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
      
      // Fallback: tenta di estrarre manualmente le sezioni
      const interpretationMatch = responseText.match(/interpretation["']:\s*["']([^"']*)["']/);
      const symbolismMatch = responseText.match(/symbolism["']:\s*["']([^"']*)["']/);
      const insightMatch = responseText.match(/insight["']:\s*["']([^"']*)["']/);
      
      return {
        interpretation: interpretationMatch ? interpretationMatch[1] : 
          'Non è stato possibile generare un\'interpretazione. Riprova più tardi.',
        symbolism: symbolismMatch ? symbolismMatch[1] : 
          'Non è stato possibile identificare i simboli. Riprova più tardi.',
        insight: insightMatch ? insightMatch[1] : 
          'Non è stato possibile generare un approfondimento. Riprova più tardi.'
      };
    }
  } catch (error) {
    console.error('Errore nella richiesta ad Anthropic:', error);
    throw new Error('Errore nell\'interpretazione del sogno. Si prega di riprovare più tardi.');
  }
}