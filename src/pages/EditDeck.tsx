import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDecks } from '../context/DeckContext';

// Predefined colors for deck selection
const DECK_COLORS = [
  '#0ea5e9', // primary-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
];

// Emoji options
const EMOJI_OPTIONS = [
  '📚', '🧠', '💡', '🔍', '📝', '📊', '🧮', '🔬',
  '🔭', '📖', '📓', '📔', '📕', '📗', '📘', '📙',
  '🌍', '🧪', '🔢', '🎓', '🎯', '⚙️', '🧩', '💻',
];

export const EditDeck = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { currentDeck, setCurrentDeck, updateDeck } = useDecks();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Set current deck
  useEffect(() => {
    if (!deckId) return;
    setCurrentDeck(deckId);
  }, [deckId, setCurrentDeck]);
  
  // Load deck data
  useEffect(() => {
    if (currentDeck) {
      setName(currentDeck.name);
      setDescription(currentDeck.description);
      setColor(currentDeck.color || DECK_COLORS[0]);
      setEmoji(currentDeck.emoji || EMOJI_OPTIONS[0]);
      setTags(currentDeck.tags || []);
    }
  }, [currentDeck]);
  
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Deck name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update the deck
    updateDeck(deckId!, {
      name: name.trim(),
      description: description.trim(),
      color,
      emoji,
      tags
    });
    
    // Navigate back to the deck detail page
    navigate(`/deck/${deckId}`);
  };
  
  // Handle adding tags
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    
    setTagInput('');
  };
  
  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Deck
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Deck name */}
              <div className="mb-6">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Deck Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.name 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="e.g., JavaScript Fundamentals"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              {/* Deck description */}
              <div className="mb-6">
                <label 
                  htmlFor="description" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.description 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Describe what this deck is about..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              
              {/* Color selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deck Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {DECK_COLORS.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className={`w-8 h-8 rounded-full ${
                        color === colorOption ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : ''
                      }`}
                      style={{ backgroundColor: colorOption }}
                      aria-label={`Select color ${colorOption}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Emoji selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deck Icon
                </label>
                <div className="flex flex-wrap gap-3">
                  {EMOJI_OPTIONS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => setEmoji(emojiOption)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-xl ${
                        emoji === emojiOption 
                          ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                          : ''
                      }`}
                      aria-label={`Select emoji ${emojiOption}`}
                    >
                      {emojiOption}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-6">
                <label 
                  htmlFor="tags" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tags
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add tags..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Press Enter to add a tag
                </p>
                
                {/* Tag list */}
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div 
                  className="rounded-lg p-4 text-white"
                  style={{ 
                    backgroundColor: color,
                    backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0))'
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{emoji}</span>
                    <h3 className="font-bold">{name || 'Deck Name'}</h3>
                  </div>
                  <p className="mt-1 text-sm text-white/80">
                    {description || 'Deck description will appear here...'}
                  </p>
                </div>
              </div>
              
              {/* Submit buttons */}
              <div className="flex justify-between">
                <Link
                  to={`/deck/${deckId}`}
                  className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  className="btn btn-primary px-6 py-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 