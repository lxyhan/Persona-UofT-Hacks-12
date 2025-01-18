'use client';

import React, { useState, useEffect } from 'react';
import Chat from '@/components/chat';
import Header from '@/components/header';
import { Menu } from '@headlessui/react';
import { Clock, ChevronDown, Mic } from 'lucide-react';
import InteractiveBlackboard from '@/components/interactiveBlackboard';

// Mock API call - replace with your actual API
const mockApiCall = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    text: "Je vais au marché",
    translation: "I am going to the market",
    pronunciation: "zhuh vay oh mar-shay",
    components: [
      { word: "Je", type: "pronoun", translation: "I" },
      { word: "vais", type: "verb", translation: "am going", conjugation: "present" },
      { word: "au", type: "preposition", translation: "to the" },
      { word: "marché", type: "noun", translation: "market" }
    ]
  };
};

export default function Home() {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.1 });
  const [time, setTime] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [response, setResponse] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartSpeaking = () => {
    setIsSpeaking(true);
  };

  const handleStopSpeaking = async () => {
    setIsSpeaking(false);
    try {
      const result = await mockApiCall();
      setResponse(result);
      setShowBlackboard(true);
      // Smooth transition to zoomed state
      setTransform({
        x: 0,
        y: -5,
        scale: 2.5,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleZoomComplete = () => {
    // Smooth transition back to normal state
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
    });
    
    // Delay hiding the blackboard until zoom out animation completes
    setTimeout(() => {
      setShowBlackboard(false);
      setResponse(null);
    }, 1000);
  };

  const languages = [
    { name: 'French', flag: '/api/placeholder/24/24' },
    { name: 'Mandarin', flag: '/api/placeholder/24/24' },
    { name: 'Portuguese', flag: '/api/placeholder/24/24' }
  ];

  const activityData = [
    {
      id: 4,
      type: 'comment',
      person: { name: 'User', href: '#' },
      imageUrl: '/api/placeholder/256/256',
      comment: 'How do you say "Good morning" in French?',
      date: '7m ago',
    },
    {
      id: 5,
      type: 'comment',
      person: { name: 'AI Bot', href: '#' },
      imageUrl: '/teacher.png',
      comment: 'In French, you say "Bonjour" for "Good morning." Its pronounced as "bohn-zhoor."',
      date: '5m ago',
    },
    {
      id: 6,
      type: 'comment',
      person: { name: 'User', href: '#' },
      imageUrl: '/api/placeholder/256/256',
      comment: 'Thanks! And how do you say "Good night"?',
      date: '3m ago',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-100 flex items-center justify-center font-sans">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-[3000ms] ease-in-out"
        style={{
          backgroundImage: "url('/classroom.png')",
          transformOrigin: 'center',
          transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.scale})`,
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 max-w-7xl w-full p-6 sm:p-10 mx-4 sm:mx-auto space-y-8">
        {/* Row 1: Chat history and expanded right card */}
        <div className="grid grid-cols-12 gap-6 h-96">
          {/* Chat History */}
          <div className={`col-span-3 transition-all duration-[3000ms] ease-in-out ${
            showBlackboard ? 'opacity-0 translate-x-[-100px]' : 'opacity-100 translate-x-0'
          }`}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl h-full overflow-hidden">
              <Chat title="Chat History" activity={activityData} />
            </div>
          </div>

          {/* Main content area */}
          <div className="col-span-9">
            {showBlackboard ? (
              <InteractiveBlackboard
                response={response}
                onZoomComplete={handleZoomComplete}
              />
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl h-full">
                <div className="flex h-full">
                  {/* Left half - Teacher Avatar */}
                  <div className="w-1/2 border-r border-gray-200/30">
                    <div className="h-full relative overflow-hidden rounded-l-3xl">
                      <img
                        src="/teacher.png"
                        alt="Teacher Avatar"
                        className="absolute inset-0 w-full h-full object-cover"
                        />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h3 className="text-white text-xl font-medium">Professor Marie</h3>
                        <p className="text-white/80">French Language Expert</p>
                      </div>
                    </div>
                  </div>

                  {/* Right half - Language Selection & Controls */}
                  <div className="w-1/2 p-8 flex flex-col">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-medium text-gray-900">Current Session</h2>
                      <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-lg text-gray-800">
                          {time.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">Selected Language</h3>
                      <Menu as="div" className="relative">
                        <Menu.Button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-white/50 rounded-xl hover:bg-white/80 transition-colors">
                          <div className="flex items-center space-x-3">
                            <img
                              src="/api/placeholder/24/24"
                              alt="French flag"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span>French</span>
                          </div>
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </Menu.Button>

                        <Menu.Items className="absolute z-10 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-black/5">
                          <div className="py-2">
                            {languages.map((language) => (
                              <Menu.Item key={language.name}>
                                {({ active }) => (
                                  <button className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 ${
                                    active ? 'bg-white/80' : ''
                                  }`}>
                                    <img
                                      src={language.flag}
                                      alt={`${language.name} flag`}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span>{language.name}</span>
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Menu>
                    </div>

                    <div className="mt-auto space-y-4">
                      <button 
                        onClick={isSpeaking ? handleStopSpeaking : handleStartSpeaking}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 
                          ${isSpeaking 
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600' 
                            : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600'}
                          rounded-xl transition-colors`}
                      >
                        <Mic className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        <span>{isSpeaking ? 'Stop Speaking' : 'Start Speaking'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Header */}
        <div className={`transition-all duration-[2000ms] ease-in-out ${
          showBlackboard ? 'opacity-0 translate-y-[50px]' : 'opacity-100 translate-y-0'
        }`}>
          <div className="bg-white/70 backdrop-blur-xl shadow-2xl p-6 rounded-3xl">
            <Header />
          </div>
        </div>
      </div>
    </main>
  );
}