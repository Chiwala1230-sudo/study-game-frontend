import React from 'react';

const QuestionCard = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  onNext, 
  showResult, 
  isCorrect 
}) => {
  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-pink-500 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-purple-600 text-sm sm:text-base">Loading your question, Perez... ✨</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 transition-all">
      {/* Question Box */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 sm:p-6 mb-4 sm:mb-8 border-2 border-pink-200">
        <div className="text-center mb-1 sm:mb-2">
          <span className="text-2xl sm:text-3xl">❓</span>
        </div>
        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-purple-800 text-center leading-relaxed">
          {question.question}
        </h2>
      </div>
      
      {/* Answer Options */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {question.options && question.options.map((option, index) => {
          const optionIndex = index;
          const isSelected = selectedAnswer === optionIndex;
          const isCorrectAnswer = showResult && optionIndex === question.correct;
          const isWrongAnswer = showResult && isSelected && !isCorrectAnswer;
          
          let buttonClass = "w-full text-left p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ";
          
          if (isCorrectAnswer) {
            buttonClass += "bg-gradient-to-r from-green-100 to-emerald-100 border-green-500 text-green-800 shadow-md";
          } else if (isWrongAnswer) {
            buttonClass += "bg-gradient-to-r from-red-100 to-pink-100 border-red-500 text-red-800";
          } else if (isSelected) {
            buttonClass += "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-500 text-purple-800 shadow-md";
          } else {
            buttonClass += "border-pink-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700";
          }
          
          const letters = ['A', 'B', 'C', 'D'];
          const emojis = ['🔤', '📝', '✨', '⭐'];
          
          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(optionIndex)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  isCorrectAnswer ? 'bg-green-500 text-white' :
                  isWrongAnswer ? 'bg-red-500 text-white' :
                  isSelected ? 'bg-purple-500 text-white' :
                  'bg-pink-100 text-pink-600'
                }`}>
                  <span className="text-xs sm:text-base">{emojis[index]}</span>
                </div>
                <div className="text-xs sm:text-base">
                  <span className="font-bold mr-1 sm:mr-2">{letters[index]}.</span>
                  <span className="break-words">{option}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Explanation Section */}
      {showResult && !isCorrect && question.explanation && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-r-lg sm:rounded-r-xl shadow-md">
          <div className="flex items-start gap-2">
            <span className="text-xl sm:text-2xl">📚</span>
            <div className="flex-1">
              <p className="text-yellow-800 font-semibold text-sm sm:text-base mb-1">Let's Learn Together! 💕</p>
              <p className="text-yellow-700 text-xs sm:text-sm">{question.explanation}</p>
              {question.simpleTip && (
                <p className="text-amber-600 text-xs sm:text-sm mt-1 sm:mt-2">💡 Tip: {question.simpleTip}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showResult && !isCorrect && !question.explanation && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-r-lg sm:rounded-r-xl shadow-md">
          <p className="text-yellow-800 text-xs sm:text-sm">📚 The correct answer is: {question.options[question.correct]}</p>
          <p className="text-yellow-600 text-xs sm:text-sm mt-1">You'll get it next time, Perez! Keep going! 💪</p>
        </div>
      )}
      
      {showResult && isCorrect && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg sm:rounded-r-xl shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🎉✨🌟</span>
            <p className="text-green-800 font-semibold text-xs sm:text-sm">Amazing job, Perez! You're so smart! Keep shining! 💕</p>
          </div>
        </div>
      )}
      
      {/* Next Button */}
      {showResult && (
        <button
          onClick={onNext}
          className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition-all transform hover:scale-105 shadow-md sm:shadow-lg text-sm sm:text-base"
        >
          Next Question → ✨
        </button>
      )}
    </div>
  );
};

export default QuestionCard;