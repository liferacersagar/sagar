
import React from 'react';
import { LeafIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <LeafIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">
          NutriScore <span className="text-brand-primary">AI</span>
        </h1>
        <span className="ml-4 text-sm text-gray-400 hidden md:block">Evidence-Based Food Analysis</span>
      </div>
    </header>
  );
};
