import { createSampleDeck } from './utils/sampleData';

// Simulate the DeckContext initialization logic
const testDeckInitialization = () => {
  // Clear any existing decks
  localStorage.removeItem('flashcards-decks');
  
  // Simulate the useState initialization logic from DeckContext
  const getInitialDecks = () => {
    const savedDecks = localStorage.getItem('flashcards-decks');
    if (savedDecks) {
      const parsed = JSON.parse(savedDecks);
      return parsed;
    }
    // If no decks are found, create a sample deck
    const sampleDeck = createSampleDeck();
    return [sampleDeck];
  };
  
  // Get initial decks
  const initialDecks = getInitialDecks();
  
  // Save to localStorage
  localStorage.setItem('flashcards-decks', JSON.stringify(initialDecks));
  
  console.log('Initial decks:', initialDecks);
  console.log('Number of decks:', initialDecks.length);
  console.log('First deck name:', initialDecks[0]?.name);
  console.log('Number of cards in first deck:', initialDecks[0]?.cards?.length);
  
  return initialDecks;
};

// Run the test
testDeckInitialization(); 