/**
 * Funzioni di utilità per la gestione delle emozioni
 */

// Converte un'emozione in italiano a inglese
export function emotionToEnglish(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'felice': return 'happy';
    case 'triste': return 'sad';
    case 'curioso': return 'curious';
    case 'spaventato': return 'scared';
    case 'eccitato': return 'excited';
    case 'confuso': return 'confused';
    case 'ansioso': return 'anxious';
    case 'arrabbiato': return 'angry';
    case 'nostalgico': return 'nostalgic';
    case 'pacifico': return 'peaceful';
    case 'neutro': return 'neutral';
    default: 
      // Se l'emozione è già in inglese, la restituiamo così com'è
      if (['happy', 'sad', 'curious', 'scared', 'excited', 'confused', 'neutral', 
           'anxious', 'angry', 'nostalgic', 'peaceful'].includes(emotion.toLowerCase())) {
        return emotion.toLowerCase();
      }
      // Altrimenti ritorniamo 'neutral' come valore predefinito
      return 'neutral';
  }
}

// Converte un'emozione in inglese a italiano
export function emotionToItalian(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'happy': return 'Felice';
    case 'sad': return 'Triste';
    case 'curious': return 'Curioso';
    case 'scared': return 'Spaventato';
    case 'excited': return 'Eccitato';
    case 'confused': return 'Confuso';
    case 'anxious': return 'Ansioso';
    case 'angry': return 'Arrabbiato';
    case 'nostalgic': return 'Nostalgico';
    case 'peaceful': return 'Pacifico';
    case 'neutral': return 'Neutro';
    default:
      // Se l'emozione è già in italiano, la restituiamo così com'è
      if (['felice', 'triste', 'curioso', 'spaventato', 'eccitato', 'confuso', 'neutro',
           'ansioso', 'arrabbiato', 'nostalgico', 'pacifico'].includes(emotion.toLowerCase())) {
        return emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
      }
      // Altrimenti ritorniamo 'Neutro' come valore predefinito
      return 'Neutro';
  }
}