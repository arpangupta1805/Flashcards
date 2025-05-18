import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Deck } from '../types';
import { formatDate } from '../utils/dateUtils';
import { useDecks } from '../context/DeckContext';

interface DeckCardProps {
  deck: Deck;
  dueCardCount: number;
}

export const DeckCard = ({ deck, dueCardCount }: DeckCardProps) => {
  const { deleteDeck } = useDecks();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Generate a lighter version of the deck color for the background
  const getBgColor = () => {
    // For dark mode, we'll use CSS variables and opacity in the className
    return deck.color;
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  
  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteDeck(deck.id);
    navigate('/');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 relative"
    >
      {/* Delete button */}
      <div className="absolute top-2 right-2 z-10">
        {!showDeleteConfirm ? (
          <button
            onClick={handleDeleteClick}
            className="bg-white/30 hover:bg-white/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
            aria-label="Delete deck"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-10">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Delete deck?</p>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmDelete}
                className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Link to={`/deck/${deck.id}`} className="block h-full">
        <div 
          className="p-6 h-full flex flex-col"
          style={{ 
            backgroundColor: getBgColor(),
            backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0))'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{deck.name}</h3>
            <span className="text-2xl">{deck.emoji || '📚'}</span>
          </div>
          
          <p className="text-white/80 mb-4 flex-grow line-clamp-2">{deck.description}</p>
          
          <div className="flex justify-between items-end mt-auto">
            <div>
              <p className="text-sm text-white/70">
                {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-white/70">
                Updated {formatDate(new Date(deck.updatedAt))}
              </p>
            </div>
            
            {dueCardCount > 0 && (
              <Link 
                to={`/deck/${deck.id}/study`}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/30 transition-colors"
              >
                <span className="text-white font-medium">
                  {dueCardCount} due
                </span>
              </Link>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}; 