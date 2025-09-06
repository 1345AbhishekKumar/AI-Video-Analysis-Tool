
import React from 'react';
import { SparklesIcon } from '../constants';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-xl">
      <div className="relative w-24 h-24 text-red-500">
        <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <SparklesIcon />
        </div>
      </div>
      <h3 className="text-xl font-semibold mt-6 text-white">AI Analysis in Progress...</h3>
      <p className="text-gray-400 mt-2 max-w-md">Our AI is analyzing the title, description, thumbnail, and engagement metrics to provide you with actionable insights.</p>
    </div>
  );
};

export default Loader;
