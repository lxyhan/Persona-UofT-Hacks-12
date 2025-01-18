import React from 'react';
import { X } from 'lucide-react';

const InteractiveBlackboard = ({ response, onZoomComplete }) => {
  if (!response) return null;

  console.log('Blackboard received response:', response); // Debug log

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl relative p-16">
        {/* Close button */}
        <button
          onClick={onZoomComplete}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Simple content display */}
        <div className="flex flex-col items-center justify-center">
          {/* Main text */}
          <div className="text-4xl text-white font-medium mb-6">
            {response.text}
          </div>

          {/* Translation */}
          <div className="text-2xl text-white/80 mb-4">
            {response.translation}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBlackboard;