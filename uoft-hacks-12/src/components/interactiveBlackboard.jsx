import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Book, Mic, Globe, X } from 'lucide-react';

const InteractiveBlackboard = ({ response, onZoomComplete }) => {
  const [currentWord, setCurrentWord] = useState(null);

  if (!response) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <motion.div 
        className="w-full max-w-4xl bg-black/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Close button */}
        <button
          onClick={onZoomComplete}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Vision Pro inspired glass effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 mix-blend-overlay pointer-events-none" />
        
        {/* Content container */}
        <div className="p-16 flex flex-col items-center justify-center relative z-10">
          {/* Main phrase with floating effect */}
          <div className="text-7xl text-white font-medium mb-12 tracking-wide"
               style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
            {response.components.map((component, idx) => (
              <motion.span
                key={idx}
                className="relative group inline-block mx-3 cursor-pointer"
                onMouseEnter={() => setCurrentWord(component)}
                onMouseLeave={() => setCurrentWord(null)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {component.word}
                
                <AnimatePresence>
                  {currentWord?.word === component.word && (
                    <motion.div
                      className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl z-50 min-w-[200px]"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <div className="text-base">
                        <div className="font-medium mb-2 text-lg text-slate-800">{component.translation}</div>
                        <div className="text-sm text-slate-500 capitalize mb-1">{component.type}</div>
                        {component.conjugation && (
                          <div className="text-sm text-blue-500 font-medium">{component.conjugation} tense</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.span>
            ))}
          </div>

          {/* Translation with glow effect */}
          <div className="text-3xl text-white/90 mb-16 relative"
               style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
            {response.translation}
          </div>

          {/* Interactive tools with hover effects */}
          <div className="flex gap-12">
            {[
              { Icon: Volume2, label: "Listen", color: "from-blue-500/20 to-blue-600/20" },
              { Icon: Book, label: "Learn", color: "from-purple-500/20 to-purple-600/20" },
              { Icon: Mic, label: "Speak", color: "from-pink-500/20 to-pink-600/20" },
              { Icon: Globe, label: "Translate", color: "from-green-500/20 to-green-600/20" }
            ].map(({ Icon, label, color }) => (
              <motion.button
                key={label}
                className={`p-6 rounded-2xl transition-all group relative bg-gradient-to-b ${color} backdrop-blur-xl border border-white/10`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-8 h-8 text-white" />
                <motion.span 
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/90 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {label}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveBlackboard;