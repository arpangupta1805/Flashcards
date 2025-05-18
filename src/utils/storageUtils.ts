// Local storage management utilities

/**
 * Calculate the total size of localStorage in KB
 * @returns Object containing total size and individual item sizes
 */
export const calculateLocalStorageSize = (): { totalKB: number; items: Record<string, number> } => {
  let total = 0;
  const items: Record<string, number> = {};

  for (const key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;
    
    // Calculate size in bytes (key length + value length) * 2 (for UTF-16 encoding)
    const size = (key.length + (localStorage[key]?.length || 0)) * 2;
    items[key] = parseFloat((size / 1024).toFixed(2)); // Size in KB
    total += size;
  }

  return {
    totalKB: parseFloat((total / 1024).toFixed(2)),
    items
  };
};

/**
 * Check if localStorage is approaching its limit (typically ~5MB)
 * @param warningThresholdKB Size in KB at which to warn (default: 4000KB = ~4MB)
 * @returns Boolean indicating if storage is near capacity
 */
export const isStorageNearCapacity = (warningThresholdKB = 4000): boolean => {
  const { totalKB } = calculateLocalStorageSize();
  return totalKB > warningThresholdKB;
};

/**
 * Get the oldest decks from localStorage
 * @param count Number of old decks to retrieve
 * @returns Array of deck IDs sorted by last updated date (oldest first)
 */
export const getOldestDecks = (count = 3): string[] => {
  try {
    const decksData = localStorage.getItem('flashcards-decks');
    if (!decksData) return [];

    const decks = JSON.parse(decksData);
    
    // Sort decks by updatedAt date (oldest first)
    const sortedDecks = [...decks].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateA - dateB;
    });

    // Return IDs of the oldest decks
    return sortedDecks.slice(0, count).map(deck => deck.id);
  } catch (error) {
    console.error('Error getting oldest decks:', error);
    return [];
  }
};

/**
 * Remove specific decks from localStorage
 * @param deckIds Array of deck IDs to remove
 * @returns Boolean indicating success
 */
export const removeDecksFromStorage = (deckIds: string[]): boolean => {
  try {
    const decksData = localStorage.getItem('flashcards-decks');
    if (!decksData) return false;

    const decks = JSON.parse(decksData);
    const filteredDecks = decks.filter((deck: any) => !deckIds.includes(deck.id));
    
    localStorage.setItem('flashcards-decks', JSON.stringify(filteredDecks));
    return true;
  } catch (error) {
    console.error('Error removing decks from storage:', error);
    return false;
  }
};

/**
 * Clear all flashcards data from localStorage
 */
export const clearAllFlashcardsData = (): void => {
  const keysToRemove = [];
  
  for (const key in localStorage) {
    if (key.startsWith('flashcards-')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}; 