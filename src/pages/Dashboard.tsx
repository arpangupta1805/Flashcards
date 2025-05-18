import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDecks } from '../context/DeckContext';
import { useStats } from '../context/StatsContext';
import { DeckCard } from '../components/DeckCard';
import { StatsCard } from '../components/StatsCard';
import { StudyTimer } from '../components/StudyTimer';
import { BadgeItem } from '../components/BadgeItem';

export const Dashboard = () => {
  const { decks, getDueCards } = useDecks();
  const { stats } = useStats();
  const [newBadges, setNewBadges] = useState<string[]>([]);
  
  // Check for newly unlocked badges when the component mounts
  useEffect(() => {
    const unlockedBadgeIds = stats.badges
      .filter(badge => badge.unlocked && badge.unlockedAt)
      .map(badge => badge.id);
      
    // Get badges unlocked in the last 24 hours
    const now = new Date();
    const recentlyUnlocked = stats.badges
      .filter(badge => {
        if (!badge.unlocked || !badge.unlockedAt) return false;
        const unlockTime = new Date(badge.unlockedAt);
        const hoursSinceUnlock = (now.getTime() - unlockTime.getTime()) / (1000 * 60 * 60);
        return hoursSinceUnlock < 24;
      })
      .map(badge => badge.id);
      
    setNewBadges(recentlyUnlocked);
  }, [stats.badges]);
  
  // Get decks with due cards
  const decksWithDueCards = decks
    .map(deck => ({
      ...deck,
      dueCount: getDueCards(deck.id).length
    }))
    .filter(deck => deck.dueCount > 0)
    .sort((a, b) => b.dueCount - a.dueCount);
  
  // Calculate total cards
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  
  // Calculate mastered cards (level 5+ are considered mastered)
  const masteredCards = decks.reduce((sum, deck) => {
    return sum + deck.cards.filter(card => card.level >= 5).length;
  }, 0);
  
  // Calculate mastery percentage
  const masteryPercentage = totalCards > 0 
    ? Math.round((masteredCards / totalCards) * 100) 
    : 0;
  
  // Calculate accuracy from actual study sessions
  const accuracy = stats.totalCardsStudied > 0 
    ? Math.round((stats.totalCorrect / stats.totalCardsStudied) * 100) 
    : 0;
  
  // Get daily score (from stats context)
  const dailyScore = stats.dailyScore;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! You have {decksWithDueCards.length > 0 ? `${decksWithDueCards.length} deck${decksWithDueCards.length > 1 ? 's' : ''} with cards to review.` : 'no cards due for review.'}
          </p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-4">
          <Link 
            to="/decks" 
            className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            View All Decks
          </Link>
          
          <Link 
            to="/decks/new" 
            className="btn btn-primary"
          >
            Create New Deck
          </Link>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Study Streak" 
          value={`${stats.streak} days`} 
          icon="🔥" 
          color="red"
        />
        <StatsCard 
          title="Cards Studied" 
          value={stats.totalCardsStudied} 
          icon="🧠" 
          color="blue"
        />
        <StatsCard 
          title="Mastery" 
          value={`${masteryPercentage}%`} 
          icon="🏆" 
          color="yellow"
          change={{
            value: masteredCards,
            label: "cards"
          }}
        />
        <StatsCard 
          title="Accuracy" 
          value={`${accuracy}%`} 
          icon="✅" 
          color="green"
        />
      </div>
      
      {/* Daily score */}
      <div className="mb-8">
        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 text-center">
          <h2 className="text-lg font-semibold text-primary-700 dark:text-primary-300">Daily Score</h2>
          <p className="text-3xl font-bold text-primary-800 dark:text-primary-200">{dailyScore} points</p>
        </div>
      </div>
      
      {/* Due cards section */}
      {decksWithDueCards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Cards Due for Review
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decksWithDueCards.map(deck => (
              <DeckCard 
                key={deck.id} 
                deck={deck} 
                dueCardCount={deck.dueCount} 
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Badges section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Badges Available
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.badges
            .map(badge => (
              <BadgeItem 
                key={badge.id} 
                badge={badge} 
                isNew={newBadges.includes(badge.id)} 
              />
            ))}
        </div>
      </section>
      
      {/* Study timer */}
      <StudyTimer />
    </div>
  );
}; 