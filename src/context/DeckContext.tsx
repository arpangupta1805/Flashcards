import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Deck, Flashcard, ReviewAction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { isStorageNearCapacity } from '../utils/storageUtils';

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
    const savedDecks = localStorage.getItem('flashcards-decks');
    if (savedDecks) {
      const parsed = JSON.parse(savedDecks);
      // Convert date strings back to Date objects
      return parsed.map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt),
        cards: deck.cards.map((card: any) => ({
          ...card,
          nextReview: new Date(card.nextReview),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined
        }))
      }));
    }
    return [];
  });
  
  const [currentDeck, setCurrentDeckState] = useState<Deck | null>(null);
  const [isStorageWarningOpen, setIsStorageWarningOpen] = useState(false);

  // Check storage capacity when saving data
  const saveDecksToStorage = (updatedDecks: Deck[]) => {
    try {
      localStorage.setItem('flashcards-decks', JSON.stringify(updatedDecks));
      
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
    const deck = decks.find(d => d.id === deckId) || null;
    setCurrentDeckState(deck);
  };

  const createDeck = (name: string, description: string): Deck => {
    const newDeck: Deck = {
      id: uuidv4(),
      name,
      description,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    return newDeck;
  };

  const updateDeck = (deckId: string, updates: Partial<Deck>) => {
    const updatedDecks = decks.map(deck => 
      deck.id === deckId 
        ? { 
            ...deck, 
            ...updates, 
            updatedAt: new Date() 
          } 
        : deck
    );
    
    setDecks(updatedDecks);
    
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
    const newCard: Flashcard = {
      ...card,
      id: uuidv4(),
      level: 1,
      nextReview: new Date(),
      tags: card.tags || [],
      createdAt: new Date()
    };
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: [...deck.cards, newCard],
          updatedAt: new Date()
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: [...prev.cards, newCard],
          updatedAt: new Date()
        };
      });
    }
  };

  const addCards = (deckId: string, cards: Omit<Flashcard, 'id'>[]) => {
    const newCards: Flashcard[] = cards.map(card => ({
      ...card,
      id: uuidv4(),
      level: 1,
      nextReview: new Date(),
      tags: card.tags || [],
      createdAt: new Date()
    }));
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: [...deck.cards, ...newCards],
          updatedAt: new Date()
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: [...prev.cards, ...newCards],
          updatedAt: new Date()
        };
      });
    }
  };

  const updateCard = (deckId: string, cardId: string, updates: Partial<Flashcard>) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          ),
          updatedAt: new Date()
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          ),
          updatedAt: new Date()
        };
      });
    }
  };

  const deleteCard = (deckId: string, cardId: string) => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.filter(card => card.id !== cardId),
          updatedAt: new Date()
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Update current deck if it's the one being modified
    if (currentDeck && currentDeck.id === deckId) {
      setCurrentDeckState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.filter(card => card.id !== cardId),
          updatedAt: new Date()
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