export interface SavedDream {
  id: number;
  testo: string;
  racconto: string;
  data: string;
}

const STORAGE_KEY = 'sogniSalvati';

export function getSavedDreams(): SavedDream[] {
  try {
    const savedDreams = localStorage.getItem(STORAGE_KEY);
    return savedDreams ? JSON.parse(savedDreams) : [];
  } catch (error) {
    console.error('Error retrieving saved dreams:', error);
    return [];
  }
}

export function saveDream(dream: SavedDream): SavedDream[] {
  try {
    const savedDreams = getSavedDreams();
    const updatedDreams = [dream, ...savedDreams].slice(0, 10); // Keep only the last 10 dreams
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDreams));
    return updatedDreams;
  } catch (error) {
    console.error('Error saving dream:', error);
    return getSavedDreams();
  }
}

export function removeDream(id: number): SavedDream[] {
  try {
    const savedDreams = getSavedDreams();
    const updatedDreams = savedDreams.filter(dream => dream.id !== id);
    
    if (updatedDreams.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDreams));
    }
    
    return updatedDreams;
  } catch (error) {
    console.error('Error removing dream:', error);
    return getSavedDreams();
  }
}
