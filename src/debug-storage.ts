import { createSampleDeck } from './utils/sampleData';

// Function to debug and fix localStorage
export const debugAndFixStorage = () => {
  console.log("=== DEBUGGING STORAGE ===");
  
  // Check if localStorage is available
  if (typeof localStorage === 'undefined') {
    console.error("localStorage is not available in this environment");
    return;
  }
  
  try {
    // Check current decks in localStorage
    const currentDecks = localStorage.getItem('flashcards-decks');
    console.log("Current decks in localStorage:", currentDecks);
    
    // Clear existing decks
    localStorage.removeItem('flashcards-decks');
    console.log("Cleared existing decks from localStorage");
    
    // Create and save a sample deck
    const sampleDeck = createSampleDeck();
    
    // Make sure dates are properly serialized
    const serializedDeck = {
      ...sampleDeck,
      createdAt: sampleDeck.createdAt.toISOString(),
      updatedAt: sampleDeck.updatedAt.toISOString(),
      cards: sampleDeck.cards.map(card => ({
        ...card,
        nextReview: card.nextReview.toISOString(),
        lastReviewed: card.lastReviewed ? card.lastReviewed.toISOString() : undefined,
        createdAt: card.createdAt ? card.createdAt.toISOString() : undefined
      }))
    };
    
    localStorage.setItem('flashcards-decks', JSON.stringify([serializedDeck]));
    console.log("Created and saved a sample deck to localStorage");
    
    // Verify the sample deck was saved
    const savedDecks = localStorage.getItem('flashcards-decks');
    console.log("Saved decks in localStorage:", savedDecks);
    
    if (savedDecks) {
      const parsedDecks = JSON.parse(savedDecks);
      console.log("Number of decks:", parsedDecks.length);
      console.log("First deck name:", parsedDecks[0]?.name);
      console.log("Number of cards in first deck:", parsedDecks[0]?.cards?.length);
    }
    
    console.log("=== DEBUG COMPLETE ===");
    console.log("Please refresh the page to see the sample deck");
  } catch (error) {
    console.error("Error during debug:", error);
  }
};

// The automatic execution has been removed
// debugAndFixStorage(); 