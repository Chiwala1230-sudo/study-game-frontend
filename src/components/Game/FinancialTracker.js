import React from 'react';

const FinancialTracker = ({ balance, todayEarned, todayPenalty, weeklyTotal, thresholds }) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-4 mb-4 border-2 border-amber-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-3xl mr-2">💰</span>
          <span className="font-bold text-amber-800">Kwacha Bank</span>
        </div>
        <div className="text-sm text-amber-600">✨ Keep earning! ✨</div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-700">K{balance}</div>
          <div className="text-xs text-amber-600">Total Balance</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-600">+K{todayEarned}</div>
          <div className="text-xs text-amber-600">Earned Today</div>
        </div>
        
        {todayPenalty > 0 && (
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">-K{todayPenalty}</div>
            <div className="text-xs text-amber-600">Penalty</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-xl font-bold text-purple-700">K{weeklyTotal}</div>
          <div className="text-xs text-amber-600">This Week</div>
        </div>
      </div>
      
      <div className="mt-3 text-center text-xs text-amber-700">
        <span className="inline-block bg-white rounded-full px-3 py-1">
          🎯 {thresholds.highScore}%+ = K{thresholds.highReward} reward
        </span>
      </div>
    </div>
  );
};

export default FinancialTracker;