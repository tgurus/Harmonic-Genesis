
import React from 'react';
import Icon from './Icon';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Icon path="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.603 4.551a.75.75 0 0 1 .15.025l5.903 2.53a.75.75 0 0 1 0 1.39l-5.903 2.53a.75.75 0 0 1-1.028-.819l.38-1.898a.75.75 0 0 0-.583-.811l-2.434-.811a.75.75 0 0 1 0-1.39l2.434-.811a.75.75 0 0 0 .583-.811l-.38-1.898a.75.75 0 0 1 .878-.846ZM13.6 17.599a.75.75 0 0 1-.15-.025l-5.903-2.53a.75.75 0 0 1 0-1.39l5.903-2.53a.75.75 0 0 1 1.028.819l-.38 1.898a.75.75 0 0 0 .583.811l2.434.811a.75.75 0 0 1 0 1.39l-2.434.811a.75.75 0 0 0-.583.811l.38 1.898a.75.75 0 0 1-.878.846Z" className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Harmonic Genesis</h1>
      </div>
      <div className="text-sm text-gray-400">
        Next-Generation Harmonic Functions Spiral Analysis Suite
      </div>
    </header>
  );
};

export default Header;
