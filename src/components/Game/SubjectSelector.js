import React from 'react';

const SubjectSelector = ({ onSelectSubject, onSelectRandom }) => {
  const subjects = [
    { id: 'math', name: 'Mathematics', icon: '📐', color: 'from-red-400 to-pink-400', emoji: '🔢' },
    { id: 'english', name: 'English', icon: '📚', color: 'from-blue-400 to-cyan-400', emoji: '📖' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'from-green-400 to-emerald-400', emoji: '🧪' },
    { id: 'social', name: 'Social Studies', icon: '🌍', color: 'from-yellow-400 to-orange-400', emoji: '🌎' },
    { id: 'ct', name: 'Creative & Tech', icon: '🎨', color: 'from-purple-400 to-pink-400', emoji: '✨' }
  ];

  const handleSubjectClick = async (subjectId) => {
    console.log(`📚 Selected subject: ${subjectId}`);
    await onSelectSubject(subjectId);
  };

  const handleRandomClick = async () => {
    console.log(`🎲 Selected random questions`);
    await onSelectRandom();
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌸🎀📚</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-2">Choose Your Adventure! ✨</h2>
          <p className="text-pink-500 text-lg">Pick a subject and let's learn together, Perez! 💕</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
              className={`bg-gradient-to-r ${subject.color} text-white rounded-2xl p-6 transition-all transform hover:scale-105 hover:rotate-1 shadow-lg`}
            >
              <div className="text-5xl mb-3">{subject.emoji}</div>
              <div className="text-2xl mb-1">{subject.icon}</div>
              <div className="font-bold text-lg">{subject.name}</div>
              <div className="text-sm opacity-90 mt-2">Click to start →</div>
            </button>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleRandomClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            🎲 Surprise Me! (All Subjects)
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
          <p className="text-purple-700 text-sm text-center">
            💡 Tip: Choose any subject you want to practice, Perez! Each subject has many questions to help you become a star student! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;