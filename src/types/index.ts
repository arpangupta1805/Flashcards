export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  options?: string[];
  level: number; // 1-10 for Leitner system
  nextReview: Date;
  lastReviewed?: Date;
  tags: string[];
  createdAt?: Date;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  color: string;
  emoji?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface StudySession {
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  cardsCorrect: number;
}

export interface UserStats {
  streak: number;
  lastStudyDate?: Date;
  totalCardsStudied: number;
  totalCorrect: number;
  studySessions: StudySession[];
  xp: number;
  dailyScore: number;
  lastScoreDate: string;
  studiedCardIds: string[]; // Array of card IDs that have been studied
  badges: Badge[];
  totalCardsAdded: number; // Total number of cards added to decks
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export type ReviewAction = 'know' | 'dontKnow';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
}

export interface AIGenerationParams {
  topic: string;
  subject?: string;
  className?: string;
  count: number;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  format?: 'standard' | 'multipleChoice';
  language?: 'english' | 'hindi' | 'mixed';
} 