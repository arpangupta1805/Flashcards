import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useStats } from '../context/StatsContext';
import { useDecks } from '../context/DeckContext';

// Logo SVG component
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <rect width="512" height="512" rx="100" fill="currentColor"/>
    <rect x="96" y="136" width="320" height="240" rx="16" fill="white" transform="rotate(-8 96 136)"/>
    <rect x="116" y="156" width="320" height="240" rx="16" fill="#f0f9ff" transform="rotate(-4 116 156)"/>
    <rect x="136" y="176" width="320" height="240" rx="16" fill="white"/>
    <path d="M256 160C230.4 160 208 178.4 208 204C208 212.8 210.4 220.8 214.4 228C201.6 236 192 250.4 192 268C192 285.6 201.6 300.8 214.4 308C210.4 315.2 208 323.2 208 332C208 357.6 230.4 376 256 376C281.6 376 304 357.6 304 332C304 323.2 301.6 315.2 297.6 308C310.4 300.8 320 285.6 320 268C320 250.4 310.4 236 297.6 228C301.6 220.8 304 212.8 304 204C304 178.4 281.6 160 256 160Z" fill="white"/>
    <path d="M208 268L224 300L240 268L256 300L272 268L288 300L304 268" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { stats } = useStats();
  const { getTotalDueCards } = useDecks();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const totalDueCards = getTotalDueCards();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/decks') {
      return location.pathname === '/decks' || location.pathname.startsWith('/decks/');
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-500 dark:text-primary-400">
                <Logo />
              </span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">MemoryMaster</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/decks" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/decks') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              My Decks
            </Link>
            <Link 
              to="/stats" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/stats') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Stats
            </Link>
            
            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme.mode === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {/* User stats */}
            <div className="ml-4 flex items-center">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.streak} 🔥
                </span>
              </div>
              
              {totalDueCards > 0 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-2 bg-primary-500 text-white rounded-full px-3 py-1"
                >
                  <span className="text-sm font-medium">{totalDueCards} due</span>
                </motion.div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/decks"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/decks') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              My Decks
            </Link>
            <Link
              to="/stats"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/stats') 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Stats
            </Link>
            
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.streak} 🔥 Streak
                </span>
                
                {totalDueCards > 0 && (
                  <span className="ml-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                    {totalDueCards} cards due
                  </span>
                )}
              </div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {theme.mode === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}; 