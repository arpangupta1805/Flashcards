import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDecks } from '../context/DeckContext';
import { DeckCard } from '../components/DeckCard';

export const MyDecks = () => {
  const { decks, getDueCards } = useDecks();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all user decks
  const userDecks = [...decks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Filter decks based on search term
  const filteredDecks = userDecks.filter(deck => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Decks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your flashcard decks
          </p>
        </div>
        
        <Link 
          to="/decks/new" 
          className="mt-4 md:mt-0 btn btn-primary"
        >
          Create New Deck
        </Link>
      </div>
      
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search decks by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent"
          />
          <svg 
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Decks grid */}
      {filteredDecks.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDecks.map(deck => (
            <DeckCard 
              key={deck.id} 
              deck={deck} 
              dueCardCount={getDueCards(deck.id).length} 
            />
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          {searchTerm ? (
            <p className="text-gray-600 dark:text-gray-400">
              No decks found matching "{searchTerm}". Try a different search term.
            </p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't created any decks yet. Get started by creating your first deck!
              </p>
              <Link 
                to="/decks/new" 
                className="mt-4 btn btn-primary inline-block"
              >
                Create First Deck
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 