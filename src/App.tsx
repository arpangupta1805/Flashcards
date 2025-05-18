import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DeckProvider } from './context/DeckContext';
import { StatsProvider } from './context/StatsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { MyDecks } from './pages/MyDecks';
import { DeckDetail } from './pages/DeckDetail';
import { StudyDeck } from './pages/StudyDeck';
import { CreateDeck } from './pages/CreateDeck';
import { EditDeck } from './pages/EditDeck';
import { CreateCard } from './pages/CreateCard';
import { CreateCardWithOptions } from './pages/CreateCardWithOptions';
import { Stats } from './pages/Stats';
import { StorageWarning } from './components/StorageWarning';
import { DebugStorage } from './components/DebugStorage';
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
      <Route path="/deck/:deckId/edit" element={<EditDeck />} />
      <Route path="/deck/:deckId/study" element={<StudyDeck />} />
      <Route path="/deck/:deckId/card/new" element={<CreateCard />} />
      <Route path="/deck/:deckId/card/new/options" element={<CreateCardWithOptions />} />
      <Route path="/deck/:deckId/card/:cardId/edit" element={<CreateCard isEditing />} />
      <Route path="/deck/:deckId/card/:cardId/edit/options" element={<CreateCardWithOptions isEditing />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
};

// App content with access to context
const AppContent = () => {
  const { isStorageWarningOpen, setIsStorageWarningOpen } = useDecks();
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
        
        {/* Storage warning popup */}
        <StorageWarning 
          isOpen={isStorageWarningOpen} 
          onClose={() => setIsStorageWarningOpen(false)} 
        />
        
        {/* Debug component */}
        <DebugStorage />
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
