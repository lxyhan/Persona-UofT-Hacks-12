'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const InteractiveBlackboard = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [data, setData] = useState("Sample Backend Data");

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + factor)));
  };

  // Simulate backend request
  useEffect(() => {
    const fetchData = async () => {
      // Replace with actual API call
      const response = await new Promise(resolve => 
        setTimeout(() => resolve("Backend Data Loaded"), 1000)
      );
      setData(response);
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-96 relative overflow-hidden bg-gray-900">
      <div 
        className="absolute inset-0 cursor-move"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transition: isDragging ? 'none' : 'transform 0.1s'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Blackboard content */}
        <div className="p-8 text-white font-chalk">
          {data}
          {/* Add more HTML overlays here */}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button 
          onClick={() => handleZoom(-0.1)}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={() => handleZoom(0.1)}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          <ZoomIn size={20} />
        </button>
      </div>
    </div>
  );
};

export default InteractiveBlackboard;