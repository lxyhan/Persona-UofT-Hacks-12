'use client';

import React, { useState, useEffect } from 'react';
import Chat from '@/components/chat';
import Header from '@/components/header';
import { Menu } from '@headlessui/react';
import { Clock, ChevronDown, Presentation } from 'lucide-react';
import InteractiveBlackboard from '@/components/interactiveBlackboard';
const ws = new WebSocket('ws://localhost:8081');
const LANGUAGE_DATA = [
  {
    name: 'French',
    flag: '🇫🇷',
    professor: {
      name: 'Professor Marie',
      title: 'French Language Expert',
      image: '/teacher.png',
      backgroundColor: 'from-blue-600 to-red-600',
      description: 'Professor Marie specializes in conversational French and cultural immersion. Her interactive teaching style helps students quickly develop natural speaking.'
    }
  },
  {
    name: 'Mandarin',
    flag: '🇨🇳',
    professor: {
      name: 'Professor Li Wei',
      title: 'Mandarin Language Expert',
      image: '/Chinese.png',
      backgroundColor: 'from-red-600 to-yellow-500',
      description: 'Professor Li Wei brings traditional Chinese teaching methods together with modern language learning techniques. Specializing in character writing and pronunciation, she makes Mandarin accessible to learners of all levels.'
    }
  },
  {
    name: 'Portuguese',
    flag: '🇵🇹',
    professor: {
      name: 'Professor Silva',
      title: 'Portuguese Language Expert',
      image: '/Portuguese_Teacher.png',
      backgroundColor: 'from-green-600 to-red-600',
      description: 'As a native of Lisbon, Professor Silva combines authentic Portuguese culture with language instruction. His focus on practical conversation skills helps students become confident speakers.'
    }
  },
  {
    name: 'Spanish',
    flag: '🇪🇸',
    professor: {
      name: 'Professor García',
      title: 'Spanish Language Expert',
      image: '/teacher-spanish.png',
      backgroundColor: 'from-red-600 to-yellow-600',
      description: 'Professor García specializes in Latin American and European Spanish variants. Her dynamic teaching approach incorporates music, literature, and real-world scenarios to enhance learning.'
    }
  },
  {
    name: 'German',
    flag: '🇩🇪',
    professor: {
      name: 'Professor Schmidt',
      title: 'German Language Expert',
      image: '/teacher-german.png',
      backgroundColor: 'from-black to-red-600',
      description: 'With a background in linguistics, Professor Schmidt excels at teaching German grammar and pronunciation. His structured approach ensures students build a solid foundation in the language.'
    }
  }
];

export default function Home() {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.1 });
  const [time, setTime] = useState(new Date());
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [response, setResponse] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_DATA[0]);
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    const checkZoom = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3000/should-zoom');
        if (!response.ok) {
          console.error('Server returned:', await response.text());
          return;
        }
        const data = await response.json();
        console.log('Received data:', data); // Debug log
  
        if (data.shouldZoom) {
          // Set mock response for now
          setResponse({
            text: "Je suis un message de test",
            translation: "I am a test message"
          });
          
          setLatestMessage(data.message); // Store the message if you're getting it from backend
          setShowBlackboard(true);
          setTransform({
            x: 0,
            y: -5,
            scale: 2.5,
          });
        }
      } catch (error) {
        console.error('Error checking zoom:', error);
      }
    }, 1000);
  
    return () => clearInterval(checkZoom);
  }, []);
  
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
      setLatestMessage(null); // Clear the latest message too
    }, 1000);
  };

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

    <>

    <div className="fixed top-4 right-4 z-50">
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-white/50 rounded-xl hover:bg-white/80 transition-colors">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.name}</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 z-50 w-full mt-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-black/5">
          <div className="py-2">
            {LANGUAGE_DATA.map((language) => (
              <Menu.Item key={language.name}>
                {({ active }) => (
                  <button
                    onClick={() => setSelectedLanguage(language)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 ${
                      active ? 'bg-white/80' : ''
                    }`}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>


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
                          src={selectedLanguage.professor.image}
                          alt={`${selectedLanguage.professor.name} Avatar`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Subtle colored gradient just at the bottom */}
                        <div 
                          className={`absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t ${selectedLanguage.professor.backgroundColor} opacity-20`}
                        />
                        {/* Overlay for text readability */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/50 to-transparent"
                        />
                        {/* Content container */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-xl font-medium relative z-10">{selectedLanguage.professor.name}</h3>
                          <p className="text-white/80 relative z-10">{selectedLanguage.professor.title}</p>
                        </div>
                      </div>
                    </div>
                    {/* Right half - Language Selection & Controls */}
                    <div className="w-1/2 p-8 flex flex-col">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 bg-white/50 p-3 rounded-xl">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <span className="text-lg text-gray-800">
                            {time.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Selected Language</h3>
                        <div className="bg-white/50 backdrop-blur-xl rounded-xl overflow-hidden">
                          {/* Language Header - Fixed */}
                          <div className="p-4 border-b border-gray-200/30 backdrop-blur-xl">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{selectedLanguage.flag}</span>
                              <span className="font-medium text-gray-900">{selectedLanguage.name}</span>
                            </div>
                          </div>
                          
                          {/* Scrollable Description */}
                          <div 
                            className="p-4 h-[100px] overflow-y-auto"
                            style={{ 
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(0,0,0,0.2) transparent',
                              WebkitOverflowScrolling: 'touch' // For smooth scrolling on iOS
                            }}
                          >
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {selectedLanguage.professor.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto space-y-4">
                        <button 
                          onClick={() => {
                            setShowBlackboard(true);
                            setTransform({
                              x: 0,
                              y: -5,
                              scale: 2.5,
                            });
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                            bg-blue-500/10 hover:bg-blue-500/20 text-blue-600
                            rounded-xl transition-colors"
                        >
                          <Presentation className="w-5 h-5" /> {/* or any of the other icons */}
                          <span>See Whiteboard</span>
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
    </>


  );
}