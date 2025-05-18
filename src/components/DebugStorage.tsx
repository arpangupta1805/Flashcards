import { useState, useEffect } from 'react';
import { debugAndFixStorage } from '../debug-storage';

export const DebugStorage = () => {
  const [storageData, setStorageData] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateStorageData = () => {
      try {
        const data = localStorage.getItem('flashcards-decks');
        setStorageData(data);
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    };

    // Update immediately
    updateStorageData();

    // Set up interval to update every second
    const interval = setInterval(updateStorageData, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug localStorage"
      >
        🐞
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">localStorage Debug</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-2">
        <button
          onClick={() => {
            const data = localStorage.getItem('flashcards-decks');
            console.log('Current localStorage data:', data ? JSON.parse(data) : null);
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Log to Console
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('flashcards-decks');
            setStorageData(null);
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs mr-2"
        >
          Clear Storage
        </button>

        <button
          onClick={() => {
            if (confirm('This will reset your decks to a sample deck. Continue?')) {
              debugAndFixStorage();
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          }}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          Reset to Sample
        </button>
      </div>
      
      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-64">
        {storageData ? JSON.stringify(JSON.parse(storageData), null, 2) : 'No data'}
      </pre>
    </div>
  );
}; 