import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <rect width="512" height="512" rx="100" fill="currentColor" className="text-primary-500 dark:text-primary-400"/>
                <rect x="96" y="136" width="320" height="240" rx="16" fill="white" transform="rotate(-8 96 136)"/>
                <rect x="116" y="156" width="320" height="240" rx="16" fill="#f0f9ff" transform="rotate(-4 116 156)"/>
                <rect x="136" y="176" width="320" height="240" rx="16" fill="white"/>
              </svg>
              <span className="font-bold text-gray-900 dark:text-white">MemoryMaster</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Master your knowledge with smart flashcards
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center">
            <nav className="flex space-x-4 mb-4 md:mb-0 md:mr-8">
              <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
                Home
              </Link>
              <Link to="/decks" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
                My Decks
              </Link>
              <Link to="/stats" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400">
                Stats
              </Link>
            </nav>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} MemoryMaster. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 