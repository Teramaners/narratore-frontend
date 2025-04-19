export interface SavedDream {
  id: number;
  testo: string;
  racconto: string;
  data: string;
}

/**
 * Ottiene i sogni salvati nel localStorage
 */
export function getSavedDreams(): SavedDream[] {
  try {
    const dreamsString = localStorage.getItem('dreams');
    return dreamsString ? JSON.parse(dreamsString) : [];
  } catch (error) {
    console.error('Errore nel recupero dei sogni dal localStorage:', error);
    return [];
  }
}

/**
 * Salva un sogno nel localStorage
 */
export function saveDream(dream: SavedDream): SavedDream[] {
  try {
    const dreams = getSavedDreams();
    // Verifica se il sogno esiste già e lo aggiorna, altrimenti lo aggiunge
    const existingDreamIndex = dreams.findIndex(d => d.id === dream.id);
    
    if (existingDreamIndex >= 0) {
      dreams[existingDreamIndex] = dream;
    } else {
      dreams.push(dream);
    }
    
    localStorage.setItem('dreams', JSON.stringify(dreams));
    return dreams;
  } catch (error) {
    console.error('Errore nel salvataggio del sogno nel localStorage:', error);
    return getSavedDreams();
  }
}

/**
 * Rimuove un sogno dal localStorage
 */
export function removeDream(id: number): SavedDream[] {
  try {
    let dreams = getSavedDreams();
    dreams = dreams.filter(dream => dream.id !== id);
    localStorage.setItem('dreams', JSON.stringify(dreams));
    return dreams;
  } catch (error) {
    console.error('Errore nella rimozione del sogno dal localStorage:', error);
    return getSavedDreams();
  }
}