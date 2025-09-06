import React from 'react';
import { HistoricalAnalysis } from '../types';
import { HistoryIcon } from '../constants';

interface HistorySidebarProps {
  history: HistoricalAnalysis[];
  selectedTimestamp: string;
  onSelectAnalysis: (analysis: HistoricalAnalysis) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, selectedTimestamp, onSelectAnalysis }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">
        <HistoryIcon />
        Analysis History
      </h3>
      <ul className="space-y-3">
        {history.map((item, index) => {
          const isSelected = item.timestamp === selectedTimestamp;
          return (
            <li key={item.timestamp}>
              <button
                onClick={() => onSelectAnalysis(item)}
                className={`w-full text-left p-4 rounded-lg transition-colors duration-200 ${
                  isSelected
                    ? 'bg-red-600/80 shadow-md ring-2 ring-red-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                aria-current={isSelected}
              >
                <div className="flex justify-between items-center">
                    <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                        {new Date(item.timestamp).toLocaleString()}
                    </p>
                    {index === 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Latest
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-center text-xs mt-2 space-x-2">
                  <span className={`font-medium ${isSelected ? 'text-red-200' : 'text-gray-400'}`}>
                    Virality: {item.viralityScore}
                  </span>
                  <span className={`font-medium ${isSelected ? 'text-red-200' : 'text-gray-400'}`}>
                    Title: {item.titleAnalysis.score}
                  </span>
                  <span className={`font-medium ${isSelected ? 'text-red-200' : 'text-gray-400'}`}>
                    Thumbnail: {item.thumbnailAnalysis.score}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HistorySidebar;
