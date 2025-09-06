
import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  highlight?: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, highlight = false }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = () => {
    if (highlight) return 'url(#highlight-gradient)';
    if (score < 40) return '#ef4444'; // red-500
    if (score < 70) return '#facc15'; // yellow-400
    return '#4ade80'; // green-400
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 mb-3">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" /> 
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <circle
            className="text-gray-700"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            strokeWidth="10"
            strokeLinecap="round"
            stroke={getStrokeColor()}
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${highlight ? 'text-rose-400' : 'text-white'}`}>{score}</span>
          <span className={`text-lg font-semibold ${highlight ? 'text-rose-500' : 'text-gray-400'}`}>/100</span>
        </div>
      </div>
      <h4 className="text-md font-semibold text-gray-300">{title}</h4>
    </div>
  );
};

export default ScoreCard;
