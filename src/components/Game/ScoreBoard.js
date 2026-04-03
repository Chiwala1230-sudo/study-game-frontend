import React from 'react';

const ScoreBoard = ({ score, streak, level, questionsAnswered }) => {
  const levelEmojis = {
    'Novice': '🌱',
    'Apprentice': '📘',
    'Expert': '⭐',
    'Master': '🏆',
    'Grandmaster': '👑'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-purple-700">{score}</div>
          <div className="text-xs text-purple-500">Total Points</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-pink-600">{streak}</div>
          <div className="text-xs text-pink-500">Streak</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
          <div className="text-2xl mb-1">{levelEmojis[level] || '📚'}</div>
          <div className="text-lg font-bold text-blue-700">{level}</div>
          <div className="text-xs text-blue-500">Level</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-green-700">{questionsAnswered}</div>
          <div className="text-xs text-green-500">Answered</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;