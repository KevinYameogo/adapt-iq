import React from 'react';

interface StatusIndicatorProps {
  status: 'listening' | 'processing' | 'idle';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-red-500 animate-pulse';
      case 'processing': return 'bg-yellow-500 animate-bounce';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Analyzing...';
      default: return 'Ready';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      <span className="text-sm font-medium text-slate-600">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;
