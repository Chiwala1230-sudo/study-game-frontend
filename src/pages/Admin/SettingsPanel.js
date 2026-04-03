import React, { useState } from 'react';

const SettingsPanel = ({ thresholds, onUpdateThresholds }) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  const handleSave = () => {
    onUpdateThresholds(localThresholds);
    alert('Settings saved!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Reward Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High Score Threshold (%)
          </label>
          <input
            type="number"
            value={localThresholds.highScore}
            onChange={(e) => setLocalThresholds({...localThresholds, highScore: parseInt(e.target.value)})}
            className="w-full border rounded-lg p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Score above this = reward</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High Score Reward (Kwacha)
          </label>
          <input
            type="number"
            value={localThresholds.highReward}
            onChange={(e) => setLocalThresholds({...localThresholds, highReward: parseInt(e.target.value)})}
            className="w-full border rounded-lg p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Score Threshold (%)
          </label>
          <input
            type="number"
            value={localThresholds.lowScore}
            onChange={(e) => setLocalThresholds({...localThresholds, lowScore: parseInt(e.target.value)})}
            className="w-full border rounded-lg p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Score below this = penalty</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Score Penalty (Kwacha)
          </label>
          <input
            type="number"
            value={localThresholds.lowPenalty}
            onChange={(e) => setLocalThresholds({...localThresholds, lowPenalty: parseInt(e.target.value)})}
            className="w-full border rounded-lg p-2"
          />
        </div>
        
        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg"
        >
          Save Settings
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">📋 How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Smart rotation picks weak subjects each morning</li>
          <li>• She MUST complete smart rotation first</li>
          <li>• After completion, she can play any subject</li>
          <li>• Daily score = average of smart rotation performance</li>
          <li>• Rewards/penalties apply to daily score</li>
          <li>• Total payable every Saturday</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPanel;