import { v4 as uuidv4 } from 'uuid';
import type { Deck, Flashcard } from '../types';

/**
 * Creates a sample deck with flashcards for demonstration purposes
 */
export const createSampleDeck = (): Deck => {
  const now = new Date();
  
  // Create sample cards
  const sampleCards: Flashcard[] = [
    {
      id: uuidv4(),
      question: "What is React?",
      answer: "A JavaScript library for building user interfaces",
      hint: "Created by Facebook",
      level: 1,
      nextReview: now,
      tags: ["programming", "frontend"],
      createdAt: now
    },
    {
      id: uuidv4(),
      question: "What is JSX?",
      answer: "A syntax extension for JavaScript that looks similar to HTML",
      hint: "Used in React components",
      level: 1,
      nextReview: now,
      tags: ["programming", "react"],
      createdAt: now
    },
    {
      id: uuidv4(),
      question: "What is a component in React?",
      answer: "An independent, reusable piece of UI",
      hint: "Can be functional or class-based",
      level: 1,
      nextReview: now,
      tags: ["programming", "react"],
      createdAt: now
    },
    {
      id: uuidv4(),
      question: "What is the capital of France?",
      answer: "Paris",
      options: ["London", "Berlin", "Paris", "Madrid"],
      level: 1,
      nextReview: now,
      tags: ["geography"],
      createdAt: now
    }
  ];
  
  // Create sample deck
  const sampleDeck: Deck = {
    id: uuidv4(),
    name: "Sample Deck",
    description: "A sample deck to get you started with FlashMaster",
    cards: sampleCards,
    createdAt: now,
    updatedAt: now,
    tags: ["sample", "demo"],
    color: "#4f46e5" // Indigo color
  };
  
  return sampleDeck;
}; 