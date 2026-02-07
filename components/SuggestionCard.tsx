import React from 'react';

interface SuggestionCardProps {
  engagementScore: number;
  status: string;
  suggestion: string;
  actionType: string;
  onApply: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  engagementScore, 
  status, 
  suggestion, 
  actionType, 
  onApply 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase text-slate-400">Audience Status</span>
        <span className={`text-xl font-black ${getScoreColor(engagementScore)}`}>
          {engagementScore}%
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2">{status}</h3>
      
      <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
        "{suggestion}"
      </p>

      {actionType !== 'none' && (
        <button 
          onClick={onApply}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>✨</span> Apply Suggestion
        </button>
      )}
    </div>
  );
};

export default SuggestionCard;
