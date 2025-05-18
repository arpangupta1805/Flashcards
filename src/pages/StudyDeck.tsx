import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../context/DeckContext';
import { useStats } from '../context/StatsContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Flashcard } from '../components/Flashcard';
import { StudyTimer } from '../components/StudyTimer';
import { isValidUUID } from '../utils/validationUtils';

export const StudyDeck = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studyMode = searchParams.get('mode');
  const { currentDeck, setCurrentDeck, getDueCards, reviewCard } = useDecks();
  const { startStudySession, endStudySession, recordReview, incrementCardStudied } = useStats();
  
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    sessionId: ''
  });
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Set current deck and get due cards
  useEffect(() => {
    if (!deckId) return;
    
    // Check if this is a valid UUID format
    if (!isValidUUID(deckId)) {
      console.error("StudyDeck: Invalid deck ID format:", deckId);
      navigate('/decks'); // Redirect to decks list
      return;
    }
    
    setCurrentDeck(deckId);
    
    // Get cards based on study mode
    let cardsToStudy = [];
    if (studyMode === 'all' && currentDeck) {
      // Study all cards
      cardsToStudy = [...currentDeck.cards];
    } else {
      // Study only due cards
      cardsToStudy = getDueCards(deckId);
    }
    
    // Sort cards by level (prioritize lower levels)
    const sortedCards = [...cardsToStudy].sort((a, b) => a.level - b.level);
    
    // Limit to 20 cards maximum for study sessions
    const limitedCards = sortedCards.slice(0, 20);
    setDueCards(limitedCards);
    
    // Start a new study session
    const sessionId = startStudySession(deckId);
    setSessionStats(prev => ({ ...prev, sessionId, total: limitedCards.length }));
    
    return () => {
      // Cleanup when component unmounts
      isMounted.current = false;
      
      // End the study session when component unmounts
      if (sessionStats.sessionId) {
        endStudySession(
          sessionStats.sessionId,
          sessionStats.total,
          sessionStats.correct
        );
      }
    };
  }, [deckId, setCurrentDeck, getDueCards, startStudySession, currentDeck, studyMode, navigate]);
  
  // Reference for the flashcard component
  const flashcardRef = useRef<{ handleFlip: () => void } | null>(null);
  
  // Handle keyboard shortcuts
  useKeyboardShortcuts([
    { 
      key: 'ArrowRight', 
      handler: () => {
        if (!isComplete) handleReview('know');
      }
    },
    { 
      key: 'ArrowLeft', 
      handler: () => {
        if (!isComplete) handleReview('dontKnow');
      }
    },
    { 
      key: ' ', 
      handler: () => {
        if (flashcardRef.current) {
          flashcardRef.current.handleFlip();
        }
      }
    },
    {
      key: 'Escape',
      handler: () => {
        if (deckId) navigate(`/deck/${deckId}`);
      }
    }
  ]);
  
  // Check if a card is locked (not due for review yet)
  const isCardLocked = (card: any) => {
    if (studyMode === 'all') return false; // In "all" mode, no cards are locked
    
    const now = new Date().toISOString();
    return card.nextReview > now;
  };
  
  // Handle card review
  const handleReview = (action: 'know' | 'dontKnow') => {
    if (!currentDeck || !deckId || isComplete) return;
    
    const currentCard = dueCards[currentCardIndex];
    if (!currentCard) return;
    
    // Don't allow review for locked cards
    if (isCardLocked(currentCard)) return;
    
    // Record the review
    reviewCard(deckId, currentCard.id, action);
    recordReview(action);
    
    // Track card study for stats
    incrementCardStudied(currentCard.id, action === 'know');
    
    // Update session stats
    if (action === 'know') {
      setSessionStats(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));
    }
    
    // Move to next card or complete
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsComplete(true);
      setShowConfetti(true);
      
      // End the study session
      if (sessionStats.sessionId) {
        endStudySession(
          sessionStats.sessionId,
          sessionStats.total,
          action === 'know' ? sessionStats.correct + 1 : sessionStats.correct
        );
      }
    }
  };
  
  // Flip card with space key - now handled by the flashcard component
  // const handleFlipCard = () => {
  //   if (flashcardRef.current) {
  //     flashcardRef.current.handleFlip();
  //   }
  // };
  
  // Calculate progress
  const progress = dueCards.length > 0 
    ? ((currentCardIndex) / dueCards.length) * 100 
    : 0;
  
  // If deck not found
  if (!currentDeck) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Deck not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The deck you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/decks" className="btn btn-primary">
          Back to Decks
        </Link>
      </div>
    );
  }
  
  // If no cards due or available to study
  if (dueCards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {studyMode === 'all' ? 'No cards in this deck' : 'No cards due for review'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {studyMode === 'all' 
              ? 'This deck has no cards yet. Add some cards to get started!'
              : 'You\'ve completed all reviews for this deck. Come back later when more cards are due!'}
          </p>
          <div className="flex justify-center space-x-4">
            {studyMode !== 'all' && currentDeck.cards.length > 0 && (
              <Link to={`/deck/${deckId}/study?mode=all`} className="btn btn-primary">
                Study All Cards
              </Link>
            )}
            <Link to={`/deck/${deckId}`} className="btn btn-primary">
              Back to Deck
            </Link>
            <Link to="/decks" className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
              All Decks
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Session progress */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentDeck.name} {studyMode === 'all' ? '(All Cards)' : ''}
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Card {currentCardIndex + 1} of {dueCards.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Current card */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            {dueCards[currentCardIndex] && (
              <Flashcard
                card={dueCards[currentCardIndex]}
                onKnow={() => handleReview('know')}
                onDontKnow={() => handleReview('dontKnow')}
                ref={flashcardRef}
                isLocked={isCardLocked(dueCards[currentCardIndex])}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Review Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've reviewed all {dueCards.length} cards in this deck.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cards Mastered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessionStats.correct}/{sessionStats.total}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link to={`/deck/${deckId}`} className="btn btn-primary">
                Back to Deck
              </Link>
              <Link to="/decks" className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                All Decks
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Study timer */}
      <StudyTimer />
      
      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <span className="mr-2">Keyboard shortcuts:</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-1">Space</span>
          <span className="mr-2">Flip</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-1">←</span>
          <span className="mr-2">Don't Know</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-1">→</span>
          <span className="mr-2">Know</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-1">Esc</span>
          <span>Back</span>
        </div>
      </div>
      
      {/* Confetti effect on completion */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* This would be implemented with a confetti library in a real app */}
          {/* For now, we'll just show some emoji as a placeholder */}
          <div className="absolute top-10 left-1/4 animate-bounce text-2xl">🎊</div>
          <div className="absolute top-20 left-1/3 animate-bounce delay-300 text-2xl">🎉</div>
          <div className="absolute top-15 left-2/3 animate-bounce delay-500 text-2xl">🎊</div>
          <div className="absolute top-30 left-1/2 animate-bounce delay-700 text-2xl">🎉</div>
        </div>
      )}
    </div>
  );
}; 