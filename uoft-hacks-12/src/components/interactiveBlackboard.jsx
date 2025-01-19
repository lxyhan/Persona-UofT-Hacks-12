import React, { useState } from 'react';
import { X, Volume2, Coffee, Globe, BookOpen, MessageCircle, ThumbsUp, Building2 } from 'lucide-react';

const InteractiveBlackboard = ({ onZoomComplete }) => {
  const [activeTab, setActiveTab] = useState('context');
  
  // Hardcoded mock data
  const response = {
    text: "Je peux avoir un café s'il vous plaît?",
    translation: "Can I have a coffee please?",
    literal: "I can to have a coffee please?",
    difficulty: "Beginner",
    formality: "Polite",
    context: {
      casual: "Je veux un café",
      formal: "Je voudrais un café, s'il vous plaît",
      superFormal: "J'aimerais commander un café, s'il vous plaît"
    },
    cultural: [
      "In France, coffee is typically served as an espresso unless specified otherwise",
      "It's common to drink coffee standing at the bar counter, which is cheaper than sitting at a table",
      "The French rarely order coffee 'to go' - it's meant to be enjoyed slowly"
    ],
    vocabulary: {
      "café": {
        type: "noun",
        gender: "masculine",
        related: ["le café au lait", "le café noir", "un expresso"]
      },
      "s'il vous plaît": {
        type: "expression",
        usage: "formal politeness",
        literal: "if it pleases you"
      }
    },
    webResults: [
      {
        title: "Café de Flore",
        description: "Historic Parisian café, founded in 1880, famous for intellectual clientele",
        rating: 4.5,
        priceRange: "€€€",
        image: "/2.jpeg",
        tags: ["Historic", "Outdoor Seating", "Famous"]
      },
      {
        title: "La Caféothèque",
        description: "Specialty coffee shop in Le Marais, Paris",
        rating: 4.8,
        priceRange: "€€",
        image: "/1.jpg",
        tags: ["Specialty Coffee", "Cozy", "Modern"]
      },
      {
        title: "Coutume Café",
        description: "Modern coffee roasters with expert baristas and minimalist design",
        rating: 4.7,
        priceRange: "€€",
        image: "/3.jpeg",
        tags: ["Coffee Roasters", "Minimalist", "Brunch"]
      }
    ]
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-5xl bg-black/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl relative p-8 h-[80vh]">
        {/* Close button */}
        <button
          onClick={onZoomComplete}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Main content */}
        <div className="flex flex-col h-full">
          {/* Top section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                {response.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                {response.formality}
              </span>
            </div>
            
            {/* Main phrase */}
            <div className="text-4xl text-white font-medium mb-4 relative group">
              {response.text}
              <button className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-12 top-1/2 -translate-y-1/2">
                <Volume2 className="w-6 h-6 text-white/60 hover:text-white/80" />
              </button>
            </div>

            {/* Translation */}
            <div className="text-2xl text-white/80 mb-2">
              {response.translation}
            </div>
            
            {/* Literal translation */}
            <div className="text-sm text-white/60 italic">
              Literal: {response.literal}
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-2 mb-6 px-4">
            {[
              { id: 'context', icon: MessageCircle, label: 'Context' },
              { id: 'cultural', icon: Globe, label: 'Cultural Tips' },
              { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
              { id: 'places', icon: Building2, label: 'Places' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-4">
            {activeTab === 'context' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-white/60 mb-2">Casual</div>
                  <div className="text-white text-lg">{response.context.casual}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-white/60 mb-2">Formal</div>
                  <div className="text-white text-lg">{response.context.formal}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-white/60 mb-2">Very Formal</div>
                  <div className="text-white text-lg">{response.context.superFormal}</div>
                </div>
              </div>
            )}

            {activeTab === 'cultural' && (
              <div className="space-y-4">
                {response.cultural.map((tip, index) => (
                  <div key={index} className="flex gap-3 p-4 rounded-xl bg-white/5">
                    <Coffee className="w-5 h-5 text-white/60 flex-shrink-0 mt-1" />
                    <p className="text-white">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'vocabulary' && (
              <div className="space-y-4">
                {Object.entries(response.vocabulary).map(([word, info]) => (
                  <div key={word} className="p-4 rounded-xl bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white text-lg font-medium">{word}</div>
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                        {info.type}
                      </span>
                    </div>
                    {info.gender && (
                      <div className="text-white/60 text-sm mb-2">Gender: {info.gender}</div>
                    )}
                    {info.usage && (
                      <div className="text-white/60 text-sm mb-2">Usage: {info.usage}</div>
                    )}
                    {info.literal && (
                      <div className="text-white/60 text-sm mb-2">Literal: {info.literal}</div>
                    )}
                    {info.related && (
                      <div className="mt-3">
                        <div className="text-white/60 text-sm mb-2">Related phrases:</div>
                        <div className="flex flex-wrap gap-2">
                          {info.related.map((phrase, index) => (
                            <span key={index} className="px-2 py-1 rounded-full bg-white/10 text-white">
                              {phrase}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'places' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.webResults.map((place, index) => (
                  <div key={index} className="rounded-xl bg-white/5 overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={place.image} 
                        alt={place.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center gap-2">
                        <span>{place.rating}</span>
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-white text-lg font-medium">{place.title}</div>
                        <span className="text-white/60">{place.priceRange}</span>
                      </div>
                      <p className="text-white/80 mb-3">{place.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {place.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBlackboard;