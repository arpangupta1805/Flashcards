import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateLocalStorageSize, getOldestDecks, removeDecksFromStorage, clearAllFlashcardsData } from '../utils/storageUtils';
import { useDecks } from '../context/DeckContext';

interface StorageWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageWarning = ({ isOpen, onClose }: StorageWarningProps) => {
  const { decks } = useDecks();
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ totalKB: number; items: Record<string, number> }>({ 
    totalKB: 0, 
    items: {} 
  });
  const [oldestDecks, setOldestDecks] = useState<any[]>([]);
  
  // Get storage info and oldest decks when component mounts or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const info = calculateLocalStorageSize();
      setStorageInfo(info);
      
      // Get oldest decks
      const oldestDeckIds = getOldestDecks(5);
      const oldestDeckObjects = decks
        .filter(deck => oldestDeckIds.includes(deck.id))
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateA - dateB;
        });
      
      setOldestDecks(oldestDeckObjects);
      
      // Pre-select the oldest 3 decks
      setSelectedDecks(oldestDeckIds.slice(0, 3));
    }
  }, [isOpen, decks]);
  
  const toggleDeckSelection = (deckId: string) => {
    setSelectedDecks(prev => 
      prev.includes(deckId)
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId]
    );
  };
  
  const handleRemoveSelected = () => {
    if (selectedDecks.length === 0) return;
    
    const success = removeDecksFromStorage(selectedDecks);
    if (success) {
      // Update storage info
      setStorageInfo(calculateLocalStorageSize());
      // Remove selected decks from the list
      setOldestDecks(prev => prev.filter(deck => !selectedDecks.includes(deck.id)));
      setSelectedDecks([]);
      
      // Close the modal if storage is now below threshold
      if (storageInfo.totalKB < 4000) {
        onClose();
      }
    }
  };
  
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL flashcard data? This cannot be undone.')) {
      clearAllFlashcardsData();
      onClose();
      // Force reload to update the UI
      window.location.reload();
    }
  };
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Storage Warning
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your browser's local storage is getting full ({storageInfo.totalKB.toFixed(2)} KB used).
              This may cause data loss or prevent saving new flashcards.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please select some older decks to remove and free up space:
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Oldest Decks
              </h3>
              
              {oldestDecks.length > 0 ? (
                <div className="space-y-2">
                  {oldestDecks.map(deck => (
                    <div 
                      key={deck.id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        id={`deck-${deck.id}`}
                        checked={selectedDecks.includes(deck.id)}
                        onChange={() => toggleDeckSelection(deck.id)}
                        className="mr-3 h-5 w-5 text-primary-600 rounded"
                      />
                      <label htmlFor={`deck-${deck.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {deck.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {deck.cards.length} cards • Last updated: {formatDate(deck.updatedAt)}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No decks available to remove.
                </p>
              )}
            </div>
            
            <div className="flex justify-between">
              <div>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear All Data
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleRemoveSelected}
                  disabled={selectedDecks.length === 0}
                  className={`btn btn-primary ${selectedDecks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Remove Selected ({selectedDecks.length})
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 