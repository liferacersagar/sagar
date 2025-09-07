
import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon, TrashIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const getScoreColorClass = (band: string): string => {
    switch (band) {
        case 'Excellent': return 'border-l-green-400';
        case 'Good': return 'border-l-lime-400';
        case 'Fair': return 'border-l-yellow-400';
        case 'Poor': return 'border-l-orange-400';
        case 'Very Poor': return 'border-l-red-500';
        default: return 'border-l-gray-400';
    }
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-gray-700 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-secondary flex items-center">
            <HistoryIcon className="w-6 h-6 mr-2"/>
            History
        </h2>
        {history.length > 0 && (
            <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center">
                <TrashIcon className="w-4 h-4 mr-1"/> Clear
            </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>Your analyzed products will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {history.map((item) => (
            <li key={item.id}>
              <button 
                onClick={() => onSelect(item)} 
                className={`w-full text-left p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg border-l-4 ${getScoreColorClass(item.band)} transition-all duration-200 shadow-md`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-200 truncate pr-2">{item.productName}</span>
                  <span className="font-bold text-lg text-gray-300">{item.score}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.band}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
