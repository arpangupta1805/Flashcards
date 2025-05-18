import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DeckProvider } from './context/DeckContext';
import { StatsProvider } from './context/StatsContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { DeckDetail } from './pages/DeckDetail';
import { StudyDeck } from './pages/StudyDeck';
import { CreateDeck } from './pages/CreateDeck';
import { CreateCard } from './pages/CreateCard';
import { Stats } from './pages/Stats';
import { MyDecks } from './pages/MyDecks';
import { StorageWarning } from './components/StorageWarning';
import { useDecks } from './context/DeckContext';

// Wrapper component to provide location key to routes
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes key={location.pathname}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/decks" element={<MyDecks />} />
      <Route path="/decks/new" element={<CreateDeck />} />
      <Route path="/deck/:deckId" element={<DeckDetail />} />
      <Route path="/deck/:deckId/study" element={<StudyDeck />} />
      <Route path="/deck/:deckId/card/new" element={<CreateCard />} />
      <Route path="/deck/:deckId/card/:cardId/edit" element={<CreateCard isEditing />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
};

// App content with access to context
const AppContent = () => {
  const { isStorageWarningOpen, setIsStorageWarningOpen } = useDecks();
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main>
          <AppRoutes />
        </main>
        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>FlashMaster - Built with React, Tailwind CSS, and Framer Motion</p>
          </div>
        </footer>
        
        {/* Storage warning popup */}
        <StorageWarning 
          isOpen={isStorageWarningOpen} 
          onClose={() => setIsStorageWarningOpen(false)} 
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <DeckProvider>
        <StatsProvider>
          <AppContent />
        </StatsProvider>
      </DeckProvider>
    </ThemeProvider>
  );
}

export default App;
