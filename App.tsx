
import React, { useState } from 'react';
import type { AppState } from './types';
import { CANONICAL_STATE } from './constants';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Visualization from './components/Visualization';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(CANONICAL_STATE);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col md:flex-row flex-1">
          <ControlPanel state={appState} setState={setAppState} />
          <Visualization state={appState} />
        </div>
      </main>
    </div>
  );
};

export default App;
