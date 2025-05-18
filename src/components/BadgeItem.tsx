import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Badge } from '../types';
import { formatDate } from '../utils/dateUtils';

interface BadgeItemProps {
  badge: Badge;
  isNew?: boolean;
}

export const BadgeItem = ({ badge, isNew = false }: BadgeItemProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center ${!badge.unlocked ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.03 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse-success">
          NEW
        </div>
      )}
      
      <div className="text-4xl mb-2">
        {badge.icon}
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {badge.name}
      </h3>
      
      {badge.unlocked && badge.unlockedAt && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Earned {formatDate(new Date(badge.unlockedAt))}
        </p>
      )}
      
      {!badge.unlocked && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Not yet earned
        </p>
      )}
      
      {/* Tooltip showing how to earn the badge */}
      {showTooltip && (
        <div className="absolute inset-x-0 -bottom-16 z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-2 shadow-lg">
            <p>{badge.description}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 