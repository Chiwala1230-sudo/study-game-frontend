import React, { useState, useEffect } from 'react';

const StudyTimer = ({ onComplete, onBreak }) => {
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [isActive, setIsActive] = useState(true);
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          // Show break reminder every 25 minutes (1500 seconds)
          if (prev === 1500 && !showBreakReminder) {
            setShowBreakReminder(true);
            setTimeout(() => setShowBreakReminder(false), 10000);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && onComplete) {
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete, showBreakReminder]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => setIsActive(!isActive);
  
  const handleBreak = () => {
    if (onBreak) onBreak();
  };

  const progress = ((7200 - timeLeft) / 7200) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">⏰</span>
          <div>
            <div className="text-2xl font-bold text-purple-700 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-pink-500">Study Session</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-all text-sm font-semibold"
          >
            {isActive ? '⏸ Pause' : '▶️ Resume'}
          </button>
          <button
            onClick={handleBreak}
            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-all text-sm font-semibold"
          >
            ☕ Break
          </button>
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-pink-100">
          <div 
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
          ></div>
        </div>
      </div>
      
      {showBreakReminder && (
        <div className="mt-2 p-2 bg-yellow-100 rounded-lg text-center animate-pulse">
          <span className="text-sm text-yellow-800">💡 Time for a quick stretch, Perez! Take 5 minutes! 🌸</span>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;