import React from 'react';

const LevelProgress = ({ currentLevel, pointsToNextLevel }) => {
  const levelOrder = ['Novice', 'Apprentice', 'Expert', 'Master', 'Grandmaster'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = levelOrder[currentIndex + 1];
  
  const levelEmojis = {
    'Novice': '🌱',
    'Apprentice': '📘', 
    'Expert': '⭐',
    'Master': '🏆',
    'Grandmaster': '👑'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{levelEmojis[currentLevel]}</span>
          <span className="font-semibold text-purple-700">{currentLevel}</span>
        </div>
        {nextLevel && (
          <div className="flex items-center text-gray-500">
            <span className="text-sm mr-1">Next:</span>
            <span className="text-sm">{nextLevel}</span>
            <span className="text-lg ml-1">{levelEmojis[nextLevel]}</span>
          </div>
        )}
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-pink-600">
              Progress to {nextLevel || 'Max Level'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-pink-600">
              {pointsToNextLevel} points needed
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-pink-100">
          <div 
            style={{ width: `${Math.max(0, Math.min(100, 100 - (pointsToNextLevel / 100) * 100))}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
          ></div>
        </div>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Keep going, superstar! Every question brings you closer to the next level! 🌟
      </p>
    </div>
  );
};

export default LevelProgress;