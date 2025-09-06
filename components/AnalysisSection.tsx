
import React from 'react';

interface AnalysisSectionProps {
  title: string;
  children: React.ReactNode;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">{title}</h3>
      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
        {children}
      </div>
    </div>
  );
};

export default AnalysisSection;
