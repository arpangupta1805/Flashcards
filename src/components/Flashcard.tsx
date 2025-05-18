import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Flashcard as FlashcardType } from '../types';
import '../styles/flashcard.css';

interface FlashcardProps {
  card: FlashcardType;
  onKnow: () => void;
  onDontKnow: () => void;
  showHint?: boolean;
  isLocked?: boolean;
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {message}
    </motion.div>
  );
};

export const Flashcard = forwardRef<{ handleFlip: () => void }, FlashcardProps>(
  ({ card, onKnow, onDontKnow, showHint = true, isLocked = false }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showingHint, setShowingHint] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
      show: false,
      message: '',
      type: 'success'
    });

    // Reset card state when card changes
    useEffect(() => {
      setIsFlipped(false);
      setShowingHint(false);
      setSelectedOption(null);
      setShowOptions(false);
      setIsCorrect(null);
    }, [card.id]);

    const handleFlip = () => {
      if (isLocked) {
        setToast({
          show: true,
          message: 'This card is locked until its next review date',
          type: 'error'
        });
        return;
      }
      setIsFlipped(!isFlipped);
    };

    // Expose the flip function to the parent component
    useImperativeHandle(ref, () => ({
      handleFlip
    }));

    const handleKnow = () => {
      if (isLocked) {
        setToast({
          show: true,
          message: 'This card is locked until its next review date',
          type: 'error'
        });
        return;
      }
      
      if (card.options && !isFlipped && !showOptions) {
        // If card has options and is not flipped, show options instead
        setShowOptions(true);
      } else {
        // Show success toast
        setToast({
          show: true,
          message: 'Great job! Card marked as known.',
          type: 'success'
        });
        
        // Delay to show feedback before moving to next card
        setTimeout(() => {
          onKnow();
          setIsFlipped(false);
          setShowOptions(false);
          setSelectedOption(null);
          setIsCorrect(null);
        }, 1000);
      }
    };

    const handleDontKnow = () => {
      if (isLocked) {
        setToast({
          show: true,
          message: 'This card is locked until its next review date',
          type: 'error'
        });
        return;
      }
      
      // Show error toast
      setToast({
        show: true,
        message: 'Card marked for review. Keep practicing!',
        type: 'error'
      });
      
      // Delay to show feedback before moving to next card
      setTimeout(() => {
        onDontKnow();
        setIsFlipped(false);
        setShowOptions(false);
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1000);
    };

    const toggleHint = () => {
      setShowingHint(!showingHint);
    };

    const handleOptionSelect = (option: string) => {
      if (isLocked) {
        setToast({
          show: true,
          message: 'This card is locked until its next review date',
          type: 'error'
        });
        return;
      }
      
      setSelectedOption(option);
      const correct = option === card.answer;
      setIsCorrect(correct);
      
      // Show appropriate toast
      setToast({
        show: true,
        message: correct ? 'Correct! Well done!' : 'Incorrect. The right answer is: ' + card.answer,
        type: correct ? 'success' : 'error'
      });
      
      // Delay to show feedback before moving to next card
      setTimeout(() => {
        if (correct) {
          onKnow();
        } else {
          onDontKnow();
        }
        setIsFlipped(false);
        setShowOptions(false);
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent default behavior for our shortcut keys
        if ([' ', 'Enter', 'ArrowRight', 'ArrowLeft', 'h', 'H', '1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
        }
        
        if (isLocked) {
          return;
        }
        
        if (e.key === ' ' || e.key === 'Enter') {
          // Space or Enter to flip card
          handleFlip();
        } else if (e.key === 'ArrowRight') {
          // Right arrow for "Know"
          if (isFlipped || showOptions) {
            handleKnow();
          }
        } else if (e.key === 'ArrowLeft') {
          // Left arrow for "Don't Know"
          if (isFlipped || showOptions) {
            handleDontKnow();
          }
        } else if (e.key === 'h' || e.key === 'H') {
          // H key for hint
          if (card.hint && !isFlipped) {
            toggleHint();
          }
        } else if (['1', '2', '3', '4'].includes(e.key) && showOptions && card.options) {
          // Number keys for options
          const index = parseInt(e.key) - 1;
          if (index >= 0 && index < card.options.length) {
            handleOptionSelect(card.options[index]);
          }
        }
      };
      
      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
      
      // Remove event listener on cleanup
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isFlipped, showOptions, card.options, card.hint, isLocked]);

    // Create shuffled options, ensuring the correct answer is included
    const shuffledOptions = card.options 
      ? [...card.options].sort(() => Math.random() - 0.5) 
      : [];

    return (
      <div className="w-full max-w-xl mx-auto">
        {/* Toast notification */}
        <AnimatePresence>
          {toast.show && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast({ ...toast, show: false })} 
            />
          )}
        </AnimatePresence>
        
        {/* Locked indicator */}
        {isLocked && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center">
            <span className="mr-2 text-yellow-500">🔒</span>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This card is locked until its next review date based on your spaced repetition schedule.
            </p>
          </div>
        )}
        
        {/* Card container with 3D perspective */}
        <div className="card-container">
          <div className={`card ${isFlipped ? 'flipped' : ''} ${isLocked ? 'opacity-75' : ''}`}>
            {/* Front of card */}
            <div className="card-face card-front">
              <div className="card-content">
                <h2 className="text-2xl font-bold text-center">{card.question}</h2>
              </div>
              
              {showHint && card.hint && (
                <div className="mt-4">
                  <button 
                    onClick={toggleHint} 
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
                    disabled={isLocked}
                  >
                    {showingHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                  
                  {showingHint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic"
                    >
                      Hint: {card.hint}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Multiple choice options */}
              {showOptions && card.options && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  {shuffledOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      disabled={selectedOption !== null || isLocked}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedOption === option
                          ? isCorrect
                            ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500'
                            : 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      } ${
                        selectedOption !== null && option === card.answer && !isCorrect
                          ? 'ring-2 ring-green-500 dark:ring-green-400'
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 w-6 h-6 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span>{option}</span>
                        {selectedOption === option && (
                          <span className="ml-auto">
                            {isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                        {selectedOption !== null && option === card.answer && !isCorrect && (
                          <span className="ml-auto">✅</span>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            
            {/* Back of card */}
            <div className="card-face card-back">
              <div className="card-content">
                <p className="text-xl text-center">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card controls */}
        <div className="mt-8 flex justify-center space-x-4">
          {!showOptions && (
            <button 
              onClick={handleFlip}
              className={`btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLocked}
            >
              {isFlipped ? 'Hide Answer' : 'Show Answer'}
            </button>
          )}
          
          <button 
            onClick={handleDontKnow}
            className={`btn btn-danger ${isLocked || (!isFlipped && !showOptions) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLocked || (!isFlipped && !showOptions)}
          >
            <span className="mr-1">❌</span> Don't Know
          </button>
          
          <button 
            onClick={handleKnow}
            className={`btn btn-success ${isLocked || ((card.options && showOptions) || (!isFlipped && !card.options)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLocked || ((card.options && showOptions) || (!isFlipped && !card.options))}
          >
            <span className="mr-1">✅</span> {card.options && !isFlipped && !showOptions ? 'Test Me' : 'Know'}
          </button>
        </div>
        
        {/* Keyboard shortcuts help */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Keyboard shortcuts: Space (Flip), → (Know), ← (Don't Know), H (Hint), 1-4 (Select Option)</p>
        </div>
      </div>
    );
  }
); 