import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Deck, Flashcard, ReviewAction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { isStorageNearCapacity } from '../utils/storageUtils';
import { createSampleDeck } from '../utils/sampleData';

interface DeckContextType {
  decks: Deck[];
  currentDeck: Deck | null;
  setCurrentDeck: (deckId: string) => void;
  createDeck: (name: string, description: string) => Deck;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  deleteDeck: (deckId: string) => void;
  addCard: (deckId: string, card: Omit<Flashcard, 'id'>) => void;
  addCards: (deckId: string, cards: Omit<Flashcard, 'id'>[]) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  reviewCard: (deckId: string, cardId: string, action: ReviewAction) => void;
  getDueCards: (deckId: string) => Flashcard[];
  getTotalDueCards: () => number;
  isStorageWarningOpen: boolean;
  setIsStorageWarningOpen: (isOpen: boolean) => void;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

// Helper function to calculate next review date based on level
const calculateNextReview = (level: number): Date => {
  const now = new Date();
  
  // Leitner system intervals (in days)
  const intervals = [0, 1, 2, 4, 7, 14, 30, 60, 120, 180, 365];
  const days = intervals[Math.min(level, intervals.length - 1)];
  
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      console.log("DeckContext: Initializing decks from localStorage");
      const savedDecks = localStorage.getItem('flashcards-decks');
      if (savedDecks) {
        const parsed = JSON.parse(savedDecks);
        console.log("DeckContext: Found saved decks", parsed);
        
        // Convert date strings back to Date objects
        const convertedDecks = parsed.map((deck: any) => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
          updatedAt: new Date(deck.updatedAt),
          cards: deck.cards.map((card: any) => ({
            ...card,
            nextReview: new Date(card.nextReview),
            lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
            createdAt: card.createdAt ? new Date(card.createdAt) : undefined
          }))
        }));
        
        console.log("DeckContext: Converted dates in decks", convertedDecks);
        return convertedDecks;
      }
      
      // If no decks are found, create a sample deck
      console.log("DeckContext: No decks found, creating sample deck");
      const sampleDeck = createSampleDeck();
      return [sampleDeck];
    } catch (error) {
      console.error("DeckContext: Error loading decks from localStorage", error);
      // Return an empty array if there's an error
      return [];
    }
  });
  
  const [currentDeck, setCurrentDeckState] = useState<Deck | null>(null);
  const [isStorageWarningOpen, setIsStorageWarningOpen] = useState(false);

  // Check storage capacity when saving data
  const saveDecksToStorage = (updatedDecks: Deck[]) => {
    try {
      // Serialize dates before saving to localStorage
      const serializedDecks = updatedDecks.map(deck => ({
        ...deck,
        createdAt: deck.createdAt instanceof Date ? deck.createdAt.toISOString() : deck.createdAt,
        updatedAt: deck.updatedAt instanceof Date ? deck.updatedAt.toISOString() : deck.updatedAt,
        cards: deck.cards.map(card => ({
          ...card,
          nextReview: card.nextReview instanceof Date ? card.nextReview.toISOString() : card.nextReview,
          lastReviewed: card.lastReviewed ? 
            (card.lastReviewed instanceof Date ? card.lastReviewed.toISOString() : card.lastReviewed) 
            : undefined,
          createdAt: card.createdAt ? 
            (card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt) 
            : undefined
        }))
      }));
      
      console.log("DeckContext: Serialized decks for storage", serializedDecks);
      localStorage.setItem('flashcards-decks', JSON.stringify(serializedDecks));
      
      // Check if storage is near capacity after saving
      if (isStorageNearCapacity()) {
        setIsStorageWarningOpen(true);
      }
    } catch (error) {
      console.error('Error saving decks to localStorage:', error);
      // If we hit a quota error, show the storage warning
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        setIsStorageWarningOpen(true);
      }
    }
  };

  useEffect(() => {
    saveDecksToStorage(decks);
  }, [decks]);

  // Check storage capacity on initial load
  useEffect(() => {
    if (isStorageNearCapacity()) {
      setIsStorageWarningOpen(true);
    }
  }, []);

  const setCurrentDeck = (deckId: string) => {
    console.log("DeckContext: Setting current deck", { deckId, availableDecks: decks.map(d => ({ id: d.id, name: d.name })) });
    
    // Check if decks array is empty
    if (decks.length === 0) {
      console.log("DeckContext: No decks available in state");
      // Try to reload from localStorage directly
      try {
        const savedDecks = localStorage.getItem('flashcards-decks');
        if (savedDecks) {
          const parsed = JSON.parse(savedDecks);
          console.log("DeckContext: Found saved decks in localStorage", parsed);
          
          // Convert date strings back to Date objects
          const convertedDecks = parsed.map((deck: any) => ({
            ...deck,
            createdAt: new Date(deck.createdAt),
            updatedAt: new Date(deck.updatedAt),
            cards: deck.cards.map((card: any) => ({
              ...card,
              nextReview: new Date(card.nextReview),
              lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
              createdAt: card.createdAt ? new Date(card.createdAt) : undefined
            }))
          }));
          
          // Update decks state
          setDecks(convertedDecks);
          
          // Find the requested deck in the loaded decks
          const deck = convertedDecks.find((d: Deck) => d.id === deckId) || null;
          console.log("DeckContext: Found deck in localStorage?", deck ? "Yes" : "No");
          setCurrentDeckState(deck);
          return;
        }
      } catch (error) {
        console.error("DeckContext: Error reloading decks from localStorage", error);
      }
    }
    
    const deck = decks.find(d => d.id === deckId) || null;
    console.log("DeckContext: Found deck?", deck ? "Yes" : "No");
    setCurrentDeckState(deck);
  };

  const createDeck = (name: string, description: string): Deck => {
    console.log("DeckContext: Creating deck", { name, description });
    
    const now = new Date();
    const newDeck: Deck = {
      id: uuidv4(),
      name,
      description,
      cards: [],
      createdAt: now,
      updatedAt: now,
      tags: [],
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    
    console.log("DeckContext: New deck object", newDeck);
    
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    console.log("DeckContext: Decks after update", updatedDecks);
    return newDeck;
  };

  const updateDeck = (deckId: string, updates: Partial<Deck>) => {
    console.log("DeckContext: Updating deck", { deckId, updates });
    
    const updatedDecks = decks.map(deck => 
      deck.id === deckId 
        ? { 
            ...deck, 
            ...updates, 
            updatedAt: new Date() 
          } 
        : deck
    );
    
    console.log("DeckContext: Decks after update", updatedDecks);
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being updated
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    setDecks(updatedDecks);
    
    // Reset current deck if it's the one being deleted
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(null);
    }
  };

  const addCard = (deckId: string, card: Omit<Flashcard, 'id'>) => {
    console.log("DeckContext: Adding card to deck", { deckId, card });
    
    const now = new Date();
    const newCard: Flashcard = {
      ...card,
      id: uuidv4(),
      level: 1,
      nextReview: now,
      tags: card.tags || [],
      createdAt: now
    };
    
    console.log("DeckContext: New card object", newCard);
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: [...deck.cards, newCard],
          updatedAt: now
        };
      }
      return deck;
    });
    
    console.log("DeckContext: Updated decks after adding card", updatedDecks);
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: [...prev.cards, newCard],
          updatedAt: now
        };
      });
    }
  };

  const addCards = (deckId: string, cards: Omit<Flashcard, 'id'>[]) => {
    console.log("DeckContext: Adding multiple cards to deck", { deckId, cardCount: cards.length });
    
    const now = new Date();
    const newCards: Flashcard[] = cards.map(card => ({
      ...card,
      id: uuidv4(),
      level: 1,
      nextReview: now,
      tags: card.tags || [],
      createdAt: now
    }));
    
    console.log("DeckContext: New card objects created", newCards);
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: [...deck.cards, ...newCards],
          updatedAt: now
        };
      }
      return deck;
    });
    
    console.log("DeckContext: Updated decks after adding cards", updatedDecks);
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: [...prev.cards, ...newCards],
          updatedAt: now
        };
      });
    }
  };

  const updateCard = (deckId: string, cardId: string, updates: Partial<Flashcard>) => {
    console.log("DeckContext: Updating card", { deckId, cardId, updates });
    
    const now = new Date();
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          ),
          updatedAt: now
        };
      }
      return deck;
    });
    
    console.log("DeckContext: Updated decks after updating card", updatedDecks);
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          ),
          updatedAt: now
        };
      });
    }
  };

  const deleteCard = (deckId: string, cardId: string) => {
    console.log("DeckContext: Deleting card", { deckId, cardId });
    
    const now = new Date();
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.filter(card => card.id !== cardId),
          updatedAt: now
        };
      }
      return deck;
    });
    
    console.log("DeckContext: Updated decks after deleting card", updatedDecks);
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.filter(card => card.id !== cardId),
          updatedAt: now
        };
      });
    }
  };

  const reviewCard = (deckId: string, cardId: string, action: ReviewAction) => {
    const now = new Date();
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(card => {
            if (card.id === cardId) {
              // Update level based on action
              const newLevel = action === 'know' 
                ? Math.min(card.level + 1, 10) // Move up one level, max 10
                : Math.max(card.level - 1, 1);  // Move down one level, min 1
                
              return {
                ...card,
                level: newLevel,
                lastReviewed: now,
                nextReview: calculateNextReview(newLevel)
              };
            }
            return card;
          }),
          updatedAt: now
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Save to localStorage immediately
    saveDecksToStorage(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(card => {
            if (card.id === cardId) {
              // Update level based on action
              const newLevel = action === 'know' 
                ? Math.min(card.level + 1, 10) // Move up one level, max 10
                : Math.max(card.level - 1, 1);  // Move down one level, min 1
                
              return {
                ...card,
                level: newLevel,
                lastReviewed: now,
                nextReview: calculateNextReview(newLevel)
              };
            }
            return card;
          }),
          updatedAt: now
        };
      });
    }
  };

  const getDueCards = (deckId: string): Flashcard[] => {
    const now = new Date();
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) return [];
    
    return deck.cards.filter(card => {
      // If no next review date, it's due
      if (!card.nextReview) return true;
      
      // If next review date is in the past, it's due
      return card.nextReview <= now;
    });
  };

  const getTotalDueCards = (): number => {
    const now = new Date();
    return decks.reduce((total, deck) => {
      const dueCards = deck.cards.filter(card => card.nextReview <= now);
      return total + dueCards.length;
    }, 0);
  };

  return (
    <DeckContext.Provider value={{
      decks,
      currentDeck,
      setCurrentDeck,
      createDeck,
      updateDeck,
      deleteDeck,
      addCard,
      addCards,
      updateCard,
      deleteCard,
      reviewCard,
      getDueCards,
      getTotalDueCards,
      isStorageWarningOpen,
      setIsStorageWarningOpen
    }}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDecks = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDecks must be used within a DeckProvider');
  }
  return context;
};