import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStats } from '../context/StatsContext';
import { useDecks } from '../context/DeckContext';
import { StatsCard } from '../components/StatsCard';
import { BadgeItem } from '../components/BadgeItem';
import { formatDate, getLastNDays } from '../utils/dateUtils';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export const Stats = () => {
  const { stats } = useStats();
  const { decks } = useDecks();
  const location = useLocation();
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Track correct cards for daily stats
  const [dailyCorrectCards, setDailyCorrectCards] = useState(0);
  
  // Prepare data for charts
  const [dailyReviewData, setDailyReviewData] = useState<any[]>([]);
  const [levelDistributionData, setLevelDistributionData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  
  // Reset loading state when navigating to this page
  useEffect(() => {
    setIsLoading(true);
  }, [location.key]);
  
  // Track daily correct cards when level 1 cards are answered correctly
  useEffect(() => {
    const storedCorrectCards = localStorage.getItem('flashcards-daily-correct');
    if (storedCorrectCards) {
      setDailyCorrectCards(parseInt(storedCorrectCards));
    }
  }, []);
  
  // Save daily correct cards to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('flashcards-daily-correct', dailyCorrectCards.toString());
  }, [dailyCorrectCards]);
  
  // Function to increment daily correct cards
  const incrementDailyCorrectCards = () => {
    setDailyCorrectCards(prev => prev + 1);
  };
  
  useEffect(() => {
    // Simulate loading delay
    setIsLoading(true);
    
    const loadData = async () => {
      // Get cards studied data from localStorage
      const savedDecks = localStorage.getItem('flashcards-decks');
      const parsedDecks = savedDecks ? JSON.parse(savedDecks) : [];
      const totalStoredCards = parsedDecks.reduce((sum: number, deck: any) => sum + deck.cards.length, 0);
      
      // Daily review data (last 7 days)
      const last7Days = getLastNDays(7);
      const dailyData = last7Days.map(date => {
        const dateStr = formatDate(date);
        const sessionsOnDate = stats.studySessions.filter(session => {
          const sessionDate = formatDate(new Date(session.startTime));
          return sessionDate === dateStr;
        });
        
        const cardsStudied = sessionsOnDate.reduce((sum, session) => sum + session.cardsStudied, 0);
        const cardsCorrect = sessionsOnDate.reduce((sum, session) => sum + session.cardsCorrect, 0);
        
        return {
          date: dateStr,
          cardsStudied: cardsStudied || 0,
          cardsCorrect: cardsCorrect || 0
        };
      });
      
      setDailyReviewData(dailyData);
      
      // Level distribution data
      const levelCounts = Array(10).fill(0); // 10 levels (1-10)
      
      decks.forEach(deck => {
        deck.cards.forEach(card => {
          // Ensure level is valid (1-10)
          const level = Math.min(Math.max(card.level, 1), 10);
          levelCounts[level - 1]++;
        });
      });
      
      const levelData = levelCounts.map((count, index) => ({
        name: `Level ${index + 1}`,
        value: count || 0 // Ensure we have at least 0
      }));
      
      setLevelDistributionData(levelData);
      
      // Progress over time (based on study sessions)
      const sortedSessions = [...stats.studySessions].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      // If no sessions, provide empty data
      if (sortedSessions.length === 0) {
        setProgressData([{
          date: formatDate(new Date()),
          total: totalStoredCards || 0,
          mastered: stats.totalCorrect || 0,
          accuracy: stats.totalCorrect > 0 && totalStoredCards > 0 ? Math.round((stats.totalCorrect / totalStoredCards) * 100) : 0
        }]);
      } else {
        let cumulativeCards = 0;
        let cumulativeCorrect = 0;
        
        const progressDataPoints = sortedSessions.map(session => {
          cumulativeCards += session.cardsStudied;
          cumulativeCorrect += session.cardsCorrect;
          
          return {
            date: formatDate(new Date(session.startTime)),
            total: cumulativeCards,
            mastered: cumulativeCorrect,
            accuracy: cumulativeCards > 0 ? Math.round((cumulativeCorrect / cumulativeCards) * 100) : 0
          };
        });
        
        setProgressData(progressDataPoints);
      }
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };
    
    loadData();
  }, [stats.studySessions, decks, stats.totalCorrect, location.key]);
  
  // Calculate stats
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  const masteredCards = decks.reduce((sum, deck) => {
    return sum + deck.cards.filter(card => card.level >= 5).length;
  }, 0);
  const masteryPercentage = totalCards > 0 
    ? Math.round((masteredCards / totalCards) * 100) 
    : 0;
  
  // Calculate accuracy
  const accuracy = stats.totalCardsStudied > 0 
    ? Math.round((stats.totalCorrect / stats.totalCardsStudied) * 100) 
    : 0;
  
  // Chart colors
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Handle badge hover
  const handleBadgeHover = (badgeId: string | null) => {
    setSelectedBadge(badgeId);
  };
  
  // Skeleton loading component
  const Skeleton = ({ height = "h-6", width = "w-full" }) => (
    <div className={`${height} ${width} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
  );
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        
        {/* Stats overview skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Progress chart skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Badges skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 h-32 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Your Statistics
      </h1>
      
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
          value={totalCards > 0 ? totalCards : stats.totalCardsStudied} 
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
          change={{
            value: stats.totalCorrect,
            label: "correct"
          }}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily review chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Daily Reviews
          </h2>
          
          {dailyReviewData.some(item => item.cardsStudied > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyReviewData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#ddd',
                    borderRadius: '0.5rem',
                    color: '#333'
                  }} 
                />
                <Legend />
                <Bar dataKey="cardsStudied" name="Cards Studied" fill="#0ea5e9" />
                <Bar dataKey="cardsCorrect" name="Cards Correct" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No review data available yet. Start studying to see your progress!</p>
            </div>
          )}
        </motion.div>
        
        {/* Card level distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Card Level Distribution
          </h2>
          
          {levelDistributionData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                  labelStyle={{ fill: '#333', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {levelDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} cards`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '10px',
                    border: 'none'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value, entry) => {
                    const { color } = entry;
                    return (
                      <span style={{ color: '#333', fontSize: '12px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '10px', 
                          height: '10px', 
                          backgroundColor: color,
                          marginRight: '5px',
                          borderRadius: '50%'
                        }}></span>
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>No cards available yet. Create some flashcards to see distribution!</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Progress over time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Learning Progress
        </h2>
        
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderColor: '#ddd',
                  borderRadius: '0.5rem',
                  color: '#333'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total Cards Studied" stroke="#0ea5e9" />
              <Line type="monotone" dataKey="mastered" name="Cards Mastered" stroke="#10b981" />
              <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Not enough study data yet. Keep studying to see your progress over time!</p>
          </div>
        )}
      </motion.div>
      
      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Badges Available
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.badges.map(badge => (
            <BadgeItem 
              key={badge.id} 
              badge={badge} 
              isNew={false} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}; 