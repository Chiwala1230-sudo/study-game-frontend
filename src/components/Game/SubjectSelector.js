import React from 'react';

const SubjectSelector = ({ onSelectSubject, onSelectRandom }) => {
  const subjects = [
    { id: 'math', name: 'Math', fullName: 'Mathematics', icon: '📐', color: 'from-red-400 to-pink-400', emoji: '🔢' },
    { id: 'english', name: 'English', fullName: 'English', icon: '📚', color: 'from-blue-400 to-cyan-400', emoji: '📖' },
    { id: 'science', name: 'Science', fullName: 'Science', icon: '🔬', color: 'from-green-400 to-emerald-400', emoji: '🧪' },
    { id: 'social', name: 'Social', fullName: 'Social Studies', icon: '🌍', color: 'from-yellow-400 to-orange-400', emoji: '🌎' },
    { id: 'ct', name: 'Creative', fullName: 'Creative & Tech', icon: '🎨', color: 'from-purple-400 to-pink-400', emoji: '✨' }
  ];

  const handleSubjectClick = async (subjectId) => {
    await onSelectSubject(subjectId);
  };

  const handleRandomClick = async () => {
    await onSelectRandom();
  };

  return (
    <div className="container mx-auto max-w-4xl px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🌸🎀📚</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-1 sm:mb-2">Choose Your Adventure! ✨</h2>
          <p className="text-pink-500 text-sm sm:text-lg">Pick a subject and let's learn together, Perez! 💕</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
              className={`bg-gradient-to-r ${subject.color} text-white rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all transform hover:scale-105 hover:rotate-1 shadow-md sm:shadow-lg`}
            >
              <div className="text-3xl sm:text-5xl mb-1 sm:mb-3">{subject.emoji}</div>
              <div className="text-xl sm:text-2xl mb-0 sm:mb-1">{subject.icon}</div>
              <div className="font-bold text-sm sm:text-lg">{subject.name}</div>
              <div className="text-xs sm:text-sm opacity-90 mt-1 sm:mt-2 hidden sm:block">Click to start →</div>
            </button>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleRandomClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-full transition-all transform hover:scale-105 shadow-md sm:shadow-lg text-sm sm:text-base"
          >
            🎲 Surprise Me! (All Subjects)
          </button>
        </div>
        
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg sm:rounded-xl">
          <p className="text-purple-700 text-xs sm:text-sm text-center">
            💡 Tip: Choose any subject you want to practice, Perez! Each subject has many questions to help you become a star student! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;