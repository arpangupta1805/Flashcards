import { useState } from 'react';
import { motion } from 'framer-motion';

interface MultipleChoiceOptionsProps {
  options: string[];
  correctAnswer: string;
  onChange: (options: string[]) => void;
  onCorrectAnswerChange: (answer: string) => void;
}

export const MultipleChoiceOptions = ({ 
  options, 
  correctAnswer, 
  onChange, 
  onCorrectAnswerChange 
}: MultipleChoiceOptionsProps) => {
  const [newOption, setNewOption] = useState('');
  const [error, setError] = useState('');
  
  // Add a new option
  const handleAddOption = () => {
    if (!newOption.trim()) {
      setError('Option cannot be empty');
      return;
    }
    
    if (options.includes(newOption.trim())) {
      setError('This option already exists');
      return;
    }
    
    // Add the new option
    const updatedOptions = [...options, newOption.trim()];
    onChange(updatedOptions);
    
    // If this is the first option and no correct answer is set, make it the correct answer
    if (updatedOptions.length === 1 && !correctAnswer) {
      onCorrectAnswerChange(newOption.trim());
    }
    
    // Clear the input and error
    setNewOption('');
    setError('');
  };
  
  // Remove an option
  const handleRemoveOption = (optionToRemove: string) => {
    const updatedOptions = options.filter(option => option !== optionToRemove);
    onChange(updatedOptions);
    
    // If the removed option was the correct answer, reset the correct answer
    if (optionToRemove === correctAnswer) {
      onCorrectAnswerChange(updatedOptions.length > 0 ? updatedOptions[0] : '');
    }
  };
  
  // Handle input keydown (Enter to add)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };
  
  // Set an option as the correct answer
  const handleSetCorrectAnswer = (option: string) => {
    onCorrectAnswerChange(option);
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Multiple Choice Options
      </label>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add options for multiple choice. The correct answer will be automatically included.
        </p>
        
        {/* Option input */}
        <div className="flex mb-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter an option..."
            className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleAddOption}
            className="px-4 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600"
          >
            Add
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}
        
        {/* Options list */}
        {options.length > 0 ? (
          <div className="space-y-2 mt-4">
            {options.map((option, index) => (
              <div 
                key={index}
                className={`flex items-center p-3 rounded-lg ${
                  option === correctAnswer 
                    ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="correctAnswer"
                      checked={option === correctAnswer}
                      onChange={() => handleSetCorrectAnswer(option)}
                      className="mr-2 h-4 w-4 text-primary-600"
                    />
                    <label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option}
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
            No options added yet. Add at least 2 options for multiple choice.
          </p>
        )}
      </div>
      
      {/* Hint about the correct answer */}
      {options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <span className="font-medium">Correct answer:</span> {correctAnswer || 'Not set'}
        </motion.div>
      )}
    </div>
  );
}; 