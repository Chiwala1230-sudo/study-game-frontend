import React from 'react';

const AnswerOption = ({ text, index, isSelected, isCorrect, isWrong, onSelect, disabled }) => {
  let buttonClass = "w-full text-left p-4 rounded-lg transition-all transform hover:scale-102 ";
  
  if (isCorrect) {
    buttonClass += "bg-green-100 border-2 border-green-500 text-green-800";
  } else if (isWrong) {
    buttonClass += "bg-red-100 border-2 border-red-500 text-red-800";
  } else if (isSelected) {
    buttonClass += "bg-blue-100 border-2 border-blue-500 text-blue-800";
  } else {
    buttonClass += "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-800";
  }

  return (
    <button
      className={buttonClass}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="font-semibold mr-3">
        {String.fromCharCode(65 + index)}.
      </span>
      {text}
    </button>
  );
};

export default AnswerOption;