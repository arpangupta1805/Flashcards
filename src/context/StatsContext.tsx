import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserStats, StudySession, Badge, ReviewAction, Flashcard } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getSimpleDateString } from '../utils/dateUtils';

interface StatsContextType {
  stats: UserStats;
  startStudySession: (deckId: string) => string;
  endStudySession: (sessionId: string, cardsStudied: number, cardsCorrect: number) => void;
  recordReview: (action: ReviewAction) => void;
  checkForBadges: () => Badge[];
  addDailyScore: (points: number) => void;
  incrementCardStudied: (cardId: string, isCorrect: boolean) => void;
  trackAddedCards: (cardsCount: number) => void;
}

const defaultBadges: Badge[] = [
  {
    id: 'first-review',
    name: 'First Step',
    description: 'Review your first flashcard',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'first-deck',
    name: 'Collector',
    description: 'Create your first deck',
    icon: '📚',
    unlocked: false
  },
  {
    id: 'study-streak-3',
    name: 'Consistent',
    description: 'Study 3 days in a row',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'study-streak-7',
    name: 'Dedicated',
    description: 'Study 7 days in a row',
    icon: '🔥🔥',
    unlocked: false
  },
  {
    id: 'study-streak-30',
    name: 'Unstoppable',
    description: 'Study 30 days in a row',
    icon: '🔥🔥🔥',
    unlocked: false
  },
  {
    id: 'cards-100',
    name: 'Scholar',
    description: 'Study 100 cards total',
    icon: '🧠',
    unlocked: false
  },
  {
    id: 'accuracy-80',
    name: 'Expert',
    description: 'Achieve 80% accuracy on 50+ cards',
    icon: '🏆',
    unlocked: false
  }
];

const defaultStats: UserStats = {
  streak: 0,
  totalCardsStudied: 0,
  totalCorrect: 0,
  studySessions: [],
  xp: 0,
  dailyScore: 0,
  lastScoreDate: '',
  studiedCardIds: [],
  badges: defaultBadges,
  totalCardsAdded: 0
};

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem('flashcards-stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        lastStudyDate: parsed.lastStudyDate ? new Date(parsed.lastStudyDate) : undefined,
        studySessions: parsed.studySessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        })),
        badges: parsed.badges.map((badge: any) => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined
        })),
        studiedCardIds: parsed.studiedCardIds || [],
        totalCardsAdded: parsed.totalCardsAdded || 0
      };
    }
    return defaultStats;
  });
  
  // Active study sessions
  const [activeSessions, setActiveSessions] = useState<Record<string, { deckId: string, startTime: Date }>>({});

  useEffect(() => {
    localStorage.setItem('flashcards-stats', JSON.stringify(stats));
  }, [stats]);

  // Check and update streak
  useEffect(() => {
    const checkStreak = () => {
      if (!stats.lastStudyDate) return;
      
      const now = new Date();
      const lastStudy = new Date(stats.lastStudyDate);
      
      // Reset dates to midnight for comparison
      now.setHours(0, 0, 0, 0);
      lastStudy.setHours(0, 0, 0, 0);
      
      // Calculate days difference
      const diffTime = now.getTime() - lastStudy.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Streak broken - use callback form to avoid dependency on stats
        setStats(prev => ({
          ...prev,
          streak: 0
        }));
      }
    };
    
    // Check once a day
    const intervalId = setInterval(checkStreak, 1000 * 60 * 60); // Check every hour
    checkStreak(); // Check immediately
    
    return () => clearInterval(intervalId);
  }, [stats.lastStudyDate]); // Only depend on lastStudyDate, not the entire stats object
  
  // Reset daily score at midnight
  useEffect(() => {
    const checkDailyScoreReset = () => {
      const today = getSimpleDateString(new Date());
      
      // If last score date is not today, reset daily score
      if (stats.lastScoreDate !== today) {
        setStats(prev => ({
          ...prev,
          dailyScore: 0,
          lastScoreDate: today
        }));
      }
    };
    
    // Check once when component mounts
    checkDailyScoreReset();
    
    // Set up interval to check at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Check at midnight, then every 24 hours
    const timeoutId = setTimeout(() => {
      checkDailyScoreReset();
      
      // After first midnight check, set interval for every 24 hours
      const intervalId = setInterval(checkDailyScoreReset, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, [stats.lastScoreDate]);

  const startStudySession = (deckId: string): string => {
    const sessionId = uuidv4();
    const startTime = new Date();
    
    setActiveSessions(prev => ({
      ...prev,
      [sessionId]: { deckId, startTime }
    }));
    
    return sessionId;
  };

  const endStudySession = (sessionId: string, cardsStudied: number, cardsCorrect: number) => {
    const session = activeSessions[sessionId];
    if (!session) return;
    
    const endTime = new Date();
    const newSession: StudySession = {
      deckId: session.deckId,
      startTime: session.startTime,
      endTime,
      cardsStudied,
      cardsCorrect
    };
    
    // Remove from active sessions
    setActiveSessions(prev => {
      const { [sessionId]: _, ...rest } = prev;
      return rest;
    });
    
    // Update stats
    setStats(prev => {
      const now = new Date();
      const lastStudy = prev.lastStudyDate ? new Date(prev.lastStudyDate) : new Date(0);
      
      // Reset dates to midnight for comparison
      now.setHours(0, 0, 0, 0);
      lastStudy.setHours(0, 0, 0, 0);
      
      // Check if this is a new day
      const isNewDay = now.getTime() > lastStudy.getTime();
      
      // Add to daily score
      const today = getSimpleDateString(now);
      const newDailyScore = prev.lastScoreDate === today ? 
        prev.dailyScore + cardsCorrect : 
        cardsCorrect;
      
      return {
        ...prev,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastStudyDate: new Date(),
        studySessions: [...prev.studySessions, newSession],
        dailyScore: newDailyScore,
        lastScoreDate: today
      };
    });
    
    // Check for new badges
    checkForBadges();
  };

  // Track when a card is studied for the first time
  const incrementCardStudied = (cardId: string, isCorrect: boolean) => {
    setStats(prev => {
      // Check if this card has been studied before
      if (prev.studiedCardIds.includes(cardId)) {
        // Card already counted, just update correct count if needed
        if (isCorrect) {
          return {
            ...prev,
            totalCorrect: prev.totalCorrect + 1
          };
        }
        return prev; // No change needed
      }
      
      // First time studying this card
      return {
        ...prev,
        totalCardsStudied: prev.totalCardsStudied + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        studiedCardIds: [...prev.studiedCardIds, cardId]
      };
    });
  };

  // Track when cards are added to a deck
  const trackAddedCards = (cardsCount: number) => {
    setStats(prev => ({
      ...prev,
      totalCardsAdded: prev.totalCardsAdded + cardsCount,
      // Don't update totalCardsStudied here, it should only be updated when cards are actually studied
    }));
  };

  const recordReview = (action: ReviewAction) => {
    // Add 1 point to daily score for each correct answer
    if (action === 'know') {
      addDailyScore(1);
    }
  };
  
  const addDailyScore = (points: number) => {
    const today = getSimpleDateString(new Date());
    
    setStats(prev => {
      // If last score date is not today, reset daily score
      const newDailyScore = prev.lastScoreDate === today ? 
        prev.dailyScore + points : 
        points;
      
      return {
        ...prev,
        dailyScore: newDailyScore,
        lastScoreDate: today
      };
    });
  };

  const checkForBadges = (): Badge[] => {
    const newlyUnlocked: Badge[] = [];
    
    setStats(prev => {
      const updatedBadges = [...prev.badges];
      const now = new Date();
      
      // First review badge
      const firstReviewBadge = updatedBadges.find(b => b.id === 'first-review');
      if (firstReviewBadge && !firstReviewBadge.unlocked && prev.totalCardsStudied > 0) {
        firstReviewBadge.unlocked = true;
        firstReviewBadge.unlockedAt = now;
        newlyUnlocked.push(firstReviewBadge);
      }
      
      // Study streak badges
      if (prev.streak >= 3) {
        const streakBadge3 = updatedBadges.find(b => b.id === 'study-streak-3');
        if (streakBadge3 && !streakBadge3.unlocked) {
          streakBadge3.unlocked = true;
          streakBadge3.unlockedAt = now;
          newlyUnlocked.push(streakBadge3);
        }
      }
      
      if (prev.streak >= 7) {
        const streakBadge7 = updatedBadges.find(b => b.id === 'study-streak-7');
        if (streakBadge7 && !streakBadge7.unlocked) {
          streakBadge7.unlocked = true;
          streakBadge7.unlockedAt = now;
          newlyUnlocked.push(streakBadge7);
        }
      }
      
      if (prev.streak >= 30) {
        const streakBadge30 = updatedBadges.find(b => b.id === 'study-streak-30');
        if (streakBadge30 && !streakBadge30.unlocked) {
          streakBadge30.unlocked = true;
          streakBadge30.unlockedAt = now;
          newlyUnlocked.push(streakBadge30);
        }
      }
      
      // Cards studied badge
      if (prev.totalCardsStudied >= 100) {
        const cardsBadge = updatedBadges.find(b => b.id === 'cards-100');
        if (cardsBadge && !cardsBadge.unlocked) {
          cardsBadge.unlocked = true;
          cardsBadge.unlockedAt = now;
          newlyUnlocked.push(cardsBadge);
        }
      }
      
      // Accuracy badge
      if (prev.totalCardsStudied >= 50) {
        const accuracy = (prev.totalCorrect / prev.totalCardsStudied) * 100;
        if (accuracy >= 80) {
          const accuracyBadge = updatedBadges.find(b => b.id === 'accuracy-80');
          if (accuracyBadge && !accuracyBadge.unlocked) {
            accuracyBadge.unlocked = true;
            accuracyBadge.unlockedAt = now;
            newlyUnlocked.push(accuracyBadge);
          }
        }
      }
      
      return {
        ...prev,
        badges: updatedBadges
      };
    });
    
    return newlyUnlocked;
  };

  return (
    <StatsContext.Provider value={{
      stats,
      startStudySession,
      endStudySession,
      recordReview,
      checkForBadges,
      addDailyScore,
      incrementCardStudied,
      trackAddedCards
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}; 