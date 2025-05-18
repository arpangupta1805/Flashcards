import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTimer, formatTime } from '../hooks/useTimer';

interface StudyTimerProps {
  onComplete?: () => void;
}

export const StudyTimer = ({ onComplete }: StudyTimerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25 * 60); // 25 minutes default
  
  const [timerState, timerControls] = useTimer({
    initialTime: selectedDuration,
    onComplete
  });
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const setDuration = (seconds: number) => {
    timerControls.setTime(seconds);
    setSelectedDuration(seconds);
  };
  
  // Calculate progress for the circular timer
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerState.progress);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-10"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        {/* Timer header */}
        <div className="p-4 flex items-center justify-between bg-primary-500 text-white">
          <h3 className="font-medium">Study Timer</h3>
          <button 
            onClick={toggleExpand}
            className="text-white hover:text-white/80 focus:outline-none"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Timer content */}
        <div className="p-4">
          {/* Timer display */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Circular progress */}
              <svg className="absolute w-full h-full" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                
                {/* Progress circle */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transform -rotate-90 origin-center ${
                    timerState.isRunning ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
              </svg>
              
              {/* Time display */}
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatTime(timerState.time)}
              </span>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex justify-center space-x-2">
            {!timerState.isRunning ? (
              <button
                onClick={timerControls.start}
                className="btn btn-primary px-3 py-1"
                disabled={timerState.isComplete}
              >
                {timerState.isComplete ? 'Completed' : 'Start'}
              </button>
            ) : (
              <button
                onClick={timerControls.pause}
                className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 px-3 py-1"
              >
                Pause
              </button>
            )}
            
            <button
              onClick={timerControls.reset}
              className="btn bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 px-3 py-1"
            >
              Reset
            </button>
          </div>
          
          {/* Timer presets (only visible when expanded) */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Presets:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDuration(5 * 60)} // 5 minutes (for testing)
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedDuration === 5 * 60
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  5m
                </button>
                <button
                  onClick={() => setDuration(15 * 60)} // 15 minutes
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedDuration === 15 * 60
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  15m
                </button>
                <button
                  onClick={() => setDuration(25 * 60)} // 25 minutes (Pomodoro)
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedDuration === 25 * 60
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  25m
                </button>
                <button
                  onClick={() => setDuration(45 * 60)} // 45 minutes
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedDuration === 45 * 60
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  45m
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}; 