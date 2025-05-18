import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDecks } from '../context/DeckContext';
import { MultipleChoiceOptions } from '../components/MultipleChoiceOptions';

interface CreateCardWithOptionsProps {
  isEditing?: boolean;
}

export const CreateCardWithOptions = ({ isEditing = false }: CreateCardWithOptionsProps) => {
  const { deckId, cardId } = useParams<{ deckId: string; cardId: string }>();
  const navigate = useNavigate();
  const { currentDeck, setCurrentDeck, addCard, updateCard } = useDecks();
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Multiple choice options
  const [options, setOptions] = useState<string[]>([]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  
  // Set current deck
  useEffect(() => {
    if (!deckId) return;
    setCurrentDeck(deckId);
  }, [deckId, setCurrentDeck]);
  
  // Load card data if editing
  useEffect(() => {
    if (isEditing && deckId && cardId && currentDeck) {
      const card = currentDeck.cards.find(c => c.id === cardId);
      if (card) {
        setQuestion(card.question);
        setAnswer(card.answer);
        setHint(card.hint || '');
        setTags(card.tags || []);
        
        // Set multiple choice options if they exist
        if (card.options && card.options.length > 0) {
          setOptions(card.options);
          setIsMultipleChoice(true);
        }
      } else {
        console.error(`Card with ID ${cardId} not found in deck ${deckId}`);
        // Navigate back to deck if card not found
        navigate(`/deck/${deckId}`);
      }
    }
  }, [isEditing, deckId, cardId, currentDeck, navigate]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }
    
    if (!answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    
    // Validate multiple choice options
    if (isMultipleChoice && options.length < 2) {
      newErrors.options = 'At least 2 options are required for multiple choice';
    }
    
    if (isMultipleChoice && !options.includes(answer.trim())) {
      newErrors.options = 'The correct answer must be included in the options';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Prepare card data
    const cardData = {
      id: cardId,
      question: question.trim(),
      answer: answer.trim(),
      hint: hint.trim() || undefined,
      tags,
      options: isMultipleChoice ? options : undefined,
      level: 0,
      nextReview: new Date()
    };
    
    if (isEditing && deckId && cardId) {
      // Update existing card
      updateCard(deckId, cardId, cardData);
    } else if (deckId) {
      // Add new card
      addCard(deckId, cardData);
    }
    
    // Navigate back to deck
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
  
  // Toggle multiple choice mode
  const toggleMultipleChoice = () => {
    setIsMultipleChoice(!isMultipleChoice);
    
    // If enabling multiple choice, add the current answer as the first option
    if (!isMultipleChoice && answer.trim() && !options.includes(answer.trim())) {
      setOptions([answer.trim()]);
    }
  };
  
  // Handle options change
  const handleOptionsChange = (newOptions: string[]) => {
    setOptions(newOptions);
  };
  
  // Handle correct answer change
  const handleCorrectAnswerChange = (newAnswer: string) => {
    setAnswer(newAnswer);
  };
  
  // If deck not found
  if (!currentDeck && deckId) {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {isEditing ? `Edit Card in ${currentDeck?.name}` : `Add Card to ${currentDeck?.name}`}
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Question */}
              <div className="mb-6">
                <label 
                  htmlFor="question" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Question*
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.question 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Enter the question..."
                />
                {errors.question && (
                  <p className="mt-1 text-sm text-red-500">{errors.question}</p>
                )}
              </div>
              
              {/* Multiple Choice Toggle */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="multipleChoice"
                    checked={isMultipleChoice}
                    onChange={toggleMultipleChoice}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="multipleChoice" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Make this a multiple choice question
                  </label>
                </div>
              </div>
              
              {/* Multiple Choice Options */}
              {isMultipleChoice && (
                <MultipleChoiceOptions
                  options={options}
                  correctAnswer={answer}
                  onChange={handleOptionsChange}
                  onCorrectAnswerChange={handleCorrectAnswerChange}
                />
              )}
              
              {/* Answer (only visible if not multiple choice) */}
              {!isMultipleChoice && (
                <div className="mb-6">
                  <label 
                    htmlFor="answer" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Answer*
                  </label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.answer 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter the answer..."
                  />
                  {errors.answer && (
                    <p className="mt-1 text-sm text-red-500">{errors.answer}</p>
                  )}
                </div>
              )}
              
              {/* Error for multiple choice options */}
              {errors.options && (
                <div className="mb-6">
                  <p className="text-sm text-red-500">{errors.options}</p>
                </div>
              )}
              
              {/* Hint */}
              <div className="mb-6">
                <label 
                  htmlFor="hint" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Hint (optional)
                </label>
                <input
                  type="text"
                  id="hint"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter a hint..."
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  A hint will be shown on the question side if the user requests it
                </p>
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
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <div className="bg-white dark:bg-gray-800 p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {question || 'Question will appear here...'}
                    </h3>
                    
                    {hint && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 italic">
                        Hint: {hint}
                      </p>
                    )}
                    
                    {isMultipleChoice && options.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {options.map((option, index) => (
                          <div 
                            key={index}
                            className={`p-2 rounded-lg ${
                              option === answer ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                            }`}
                          >
                            {option} {option === answer && '✓'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-gray-800 dark:text-gray-200">
                      {answer || 'Answer will appear here...'}
                    </p>
                  </div>
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
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {isEditing ? 'Save Changes' : 'Add Card'}
                  </button>
                  
                  {!isEditing && (
                    <button
                      type="submit"
                      className="btn bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                        // Reset form for next card
                        setQuestion('');
                        setAnswer('');
                        setHint('');
                        setOptions([]);
                        // Don't navigate away
                        navigate(`/deck/${deckId}/card/new`);
                      }}
                    >
                      Add & Create Another
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 