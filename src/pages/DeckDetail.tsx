import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDecks } from '../context/DeckContext';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import { isValidUUID } from '../utils/validationUtils';

export const DeckDetail = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { currentDeck, setCurrentDeck, getDueCards, deleteDeck } = useDecks();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Set current deck
  useEffect(() => {
    if (!deckId) return;
    console.log("DeckDetail: Setting current deck with ID:", deckId);
    
    // Check if this is a valid UUID format
    if (!isValidUUID(deckId)) {
      console.error("DeckDetail: Invalid deck ID format:", deckId);
      navigate('/decks'); // Redirect to decks list
      return;
    }
    
    setCurrentDeck(deckId);
  }, [deckId, setCurrentDeck, navigate]);
  
  // Debug current deck
  useEffect(() => {
    console.log("DeckDetail: Current deck:", currentDeck);
  }, [currentDeck]);
  
  // If deck not found
  if (!currentDeck) {
    console.log("DeckDetail: Deck not found for ID:", deckId);
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
  
  // Get due cards
  const dueCards = getDueCards(deckId!);
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(currentDeck.cards.flatMap(card => card.tags))
  ).filter(Boolean);
  
  // Filter cards based on search and tag
  const filteredCards = currentDeck.cards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTag = selectedTag === null || card.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
  
  // Calculate mastery level
  const calculateMasteryLevel = () => {
    if (currentDeck.cards.length === 0) return 0;
    
    const totalLevels = currentDeck.cards.reduce((sum, card) => sum + card.level, 0);
    const maxPossibleLevel = currentDeck.cards.length * 10; // Max level is 10
    
    return Math.round((totalLevels / maxPossibleLevel) * 100);
  };
  
  const masteryLevel = calculateMasteryLevel();
  
  // Handle delete
  const handleDelete = () => {
    if (!deckId) return;
    
    deleteDeck(deckId);
    navigate('/decks');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Deck header */}
      <div 
        className="rounded-xl p-4 sm:p-6 mb-8 text-white"
        style={{ 
          backgroundColor: currentDeck.color,
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0))'
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{currentDeck.emoji || '📚'}</span>
              <h1 className="text-2xl sm:text-3xl font-bold">{currentDeck.name}</h1>
            </div>
            <p className="mt-2 text-white/80">{currentDeck.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {currentDeck.tags.map(tag => (
                <span 
                  key={tag}
                  className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              to={`/deck/${deckId}/edit`}
              className="btn bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              Edit
            </Link>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn bg-red-500/80 hover:bg-red-600/80 text-white"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80">Cards</p>
            <p className="text-2xl font-bold">{currentDeck.cards.length}</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80">Due</p>
            <p className="text-2xl font-bold">{dueCards.length}</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80">Mastery</p>
            <p className="text-2xl font-bold">{masteryLevel}%</p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to={`/deck/${deckId}/study${dueCards.length > 0 ? '' : '?mode=all'}`}
            className="btn bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 text-lg font-medium w-full sm:w-auto text-center"
          >
            {dueCards.length > 0 ? `Study Now (${dueCards.length} Due)` : 'Study All Cards'}
          </Link>
          
          <div className="mb-6 flex justify-end space-x-2">
            <Link
              to={`/deck/${deckId}/card/new`}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Card
            </Link>
            
            <Link
              to={`/deck/${deckId}/card/new/options`}
              className="btn bg-purple-500 text-white hover:bg-purple-600"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 2v5a2 2 0 002 2h5" />
              </svg>
              Add Multiple Choice
            </Link>
          </div>
        </div>
      </div>
      
      {/* Cards section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Cards ({filteredCards.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTag === null
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              All
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  tag === selectedTag
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        
        {/* Cards list */}
        {filteredCards.length > 0 ? (
          <div className="space-y-4">
            {filteredCards.map(card => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-0">{card.question}</h3>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
                        Level {card.level}
                      </span>
                      <Link
                        to={`/deck/${deckId}/card/${card.id}/edit`}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-gray-600 dark:text-gray-400">
                    <p>{card.answer}</p>
                  </div>
                  
                  {card.hint && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                        Hint: {card.hint}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                      {card.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      Next review: {formatRelativeTime(card.nextReview)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedTag
                ? 'No cards match your search criteria.'
                : 'This deck has no cards yet. Add some cards to get started!'}
            </p>
            <Link 
              to={`/deck/${deckId}/card/new`}
              className="mt-4 btn btn-primary inline-block"
            >
              Add First Card
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Deck
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{currentDeck.name}"? This action cannot be undone and you will lose all cards in this deck.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}; 