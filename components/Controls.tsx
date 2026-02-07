import React from 'react';

interface ControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

const Controls: React.FC<ControlsProps> = ({ isRecording, onToggleRecording }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onToggleRecording}
        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${
          isRecording 
            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-200'
        }`}
      >
        {isRecording ? 'Stop Analysis' : 'Start Listening'}
      </button>
    </div>
  );
};

export default Controls;
