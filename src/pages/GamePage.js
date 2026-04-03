import React, { useState, useEffect } from 'react';
import QuestionCard from '../components/Game/QuestionCard';
import ScoreBoard from '../components/Game/ScoreBoard';
import LevelProgress from '../components/Game/LevelProgress';
import SubjectSelector from '../components/Game/SubjectSelector';
import StudyTimer from '../components/Game/StudyTimer';
import FinancialTracker from '../components/Game/FinancialTracker';
import { fetchQuestions, recordCorrect, recordWrong } from '../services/api';
import { getSmartRotation, calculateDailyReward } from '../utils/smartRotation';

const GamePage = () => {
  const [gameMode, setGameMode] = useState('smart-rotation-required');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState('Novice');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [smartRotationSubjects, setSmartRotationSubjects] = useState([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [smartRotationScore, setSmartRotationScore] = useState(0);
  const [smartRotationTotal, setSmartRotationTotal] = useState(0);
  const [smartRotationCompleted, setSmartRotationCompleted] = useState(false);
  
  const [balance, setBalance] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [todayEarned, setTodayEarned] = useState(0);
  const [todayPenalty, setTodayPenalty] = useState(0);
  const [dailyScore, setDailyScore] = useState(null);
  const [thresholds, setThresholds] = useState({
    highScore: 80,
    lowScore: 40,
    highReward: 5,
    lowPenalty: 5
  });
  
  const [weakSubjects, setWeakSubjects] = useState([
    { subject: 'math', wrongCount: 0, wrongRate: 0 },
    { subject: 'science', wrongCount: 0, wrongRate: 0 },
    { subject: 'english', wrongCount: 0, wrongRate: 0 },
    { subject: 'social', wrongCount: 0, wrongRate: 0 },
    { subject: 'ct', wrongCount: 0, wrongRate: 0 }
  ]);

  const studentName = "Perez";

  useEffect(() => {
    const savedBalance = localStorage.getItem('studyBalance');
    if (savedBalance) setBalance(parseInt(savedBalance));
    
    const savedWeekly = localStorage.getItem('weeklyTotal');
    if (savedWeekly) setWeeklyTotal(parseInt(savedWeekly));
    
    const rotation = getSmartRotation(weakSubjects, ['math', 'science', 'english', 'social', 'ct']);
    setSmartRotationSubjects(rotation);
  }, [weakSubjects]);

  const loadQuestionsForSubject = async (subjectId) => {
    setLoading(true);
    console.log(`📚 Loading ${subjectId} questions...`);
    const subjectQuestions = await fetchQuestions(subjectId);
    console.log(`📊 Got ${subjectQuestions.length} questions for ${subjectId}`);
    
    if (subjectQuestions.length === 0) {
      setQuestions([]);
      alert(`No questions found for ${subjectId}. Please add questions to database.`);
      setLoading(false);
      return false;
    } else {
      setQuestions(subjectQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrectAnswer(false);
      setScore(0);
      setStreak(0);
      setQuestionsAnswered(0);
      setLoading(false);
      return true;
    }
  };

  const handleStartSmartRotation = () => {
    console.log("🚀 Starting Smart Rotation");
    if (smartRotationSubjects.length > 0) {
      setSmartRotationScore(0);
      setSmartRotationTotal(0);
      setCurrentSubjectIndex(0);
      setCurrentSubject(smartRotationSubjects[0].subject);
      loadQuestionsForSubject(smartRotationSubjects[0].subject);
      setGameMode('smart-rotation-playing');
    } else {
      alert('No subjects available for rotation.');
    }
  };

  const handleSelectSubject = async (subjectId) => {
    console.log(`🎯 Free roam - selecting subject: ${subjectId}`);
    if (!smartRotationCompleted) {
      alert('⚠️ You must complete Smart Rotation first!');
      return;
    }
    
    const success = await loadQuestionsForSubject(subjectId);
    if (success) {
      setGameMode('free-roam-playing');
    }
  };

  const handleSelectRandom = async () => {
    console.log(`🎲 Free roam - selecting random questions`);
    if (!smartRotationCompleted) {
      alert('⚠️ You must complete Smart Rotation first!');
      return;
    }
    
    setLoading(true);
    const allQuestions = await fetchQuestions();
    console.log(`📊 Got ${allQuestions.length} random questions`);
    
    if (allQuestions.length === 0) {
      alert('No questions found in database!');
      setLoading(false);
      return;
    }
    
    setQuestions(allQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrectAnswer(false);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setLoading(false);
    setGameMode('free-roam-playing');
  };

  const handleCompleteSmartRotation = () => {
    let finalScore = 0;
    if (smartRotationTotal > 0) {
      finalScore = (smartRotationScore / smartRotationTotal) * 100;
    }
    
    console.log(`📊 Smart Rotation Complete: ${smartRotationScore} out of ${smartRotationTotal} = ${finalScore}%`);
    
    setDailyScore(finalScore);
    
    const reward = calculateDailyReward(finalScore, thresholds);
    
    let newBalance = balance;
    let newWeeklyTotal = weeklyTotal;
    
    if (reward.reward > 0) {
      setTodayEarned(reward.reward);
      newBalance = balance + reward.reward;
      newWeeklyTotal = weeklyTotal + reward.reward;
      setBalance(newBalance);
      setWeeklyTotal(newWeeklyTotal);
      setFeedbackMessage(reward.message);
    } else if (reward.penalty > 0) {
      setTodayPenalty(reward.penalty);
      newBalance = balance - reward.penalty;
      newWeeklyTotal = weeklyTotal - reward.penalty;
      setBalance(newBalance);
      setWeeklyTotal(newWeeklyTotal);
      setFeedbackMessage(reward.message);
    } else {
      setFeedbackMessage(reward.message);
    }
    
    localStorage.setItem('studyBalance', newBalance);
    localStorage.setItem('weeklyTotal', newWeeklyTotal);
    
    setSmartRotationCompleted(true);
    setGameMode('free-roam');
    alert(`🎉 Smart Rotation Complete!\n\nScore: ${smartRotationScore} out of ${smartRotationTotal} (${finalScore.toFixed(1)}%)\n\n${reward.message}\n\nYou can now choose any subject!`);
  };

  const handleNextSubjectInRotation = async () => {
    const nextIndex = currentSubjectIndex + 1;
    if (nextIndex < smartRotationSubjects.length) {
      setCurrentSubjectIndex(nextIndex);
      setCurrentSubject(smartRotationSubjects[nextIndex].subject);
      await loadQuestionsForSubject(smartRotationSubjects[nextIndex].subject);
    } else {
      handleCompleteSmartRotation();
    }
  };

  const calculatePoints = (isCorrect) => {
    let points = 0;
    if (isCorrect) {
      points = 10;
      if (streak >= 5) {
        points += 5;
        setFeedbackMessage('🔥 Streak Bonus! +5 points');
      } else if (streak >= 3) {
        points += 3;
        setFeedbackMessage('✨ Streak Bonus! +3 points');
      } else {
        setFeedbackMessage('✅ Correct! +10 points');
      }
    } else {
      setFeedbackMessage('❌ Keep trying! You can do it!');
    }
    return points;
  };

  const updateLevel = (newScore) => {
    if (newScore >= 500) setLevel('Grandmaster');
    else if (newScore >= 300) setLevel('Master');
    else if (newScore >= 150) setLevel('Expert');
    else if (newScore >= 50) setLevel('Apprentice');
    else setLevel('Novice');
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      console.error('No current question!');
      return;
    }
    
    const isCorrect = answerIndex === currentQuestion.correct;
    setIsCorrectAnswer(isCorrect);
    const pointsEarned = calculatePoints(isCorrect);
    
    if (isCorrect) {
      setScore(prevScore => {
        const newScore = prevScore + pointsEarned;
        updateLevel(newScore);
        return newScore;
      });
      setStreak(prev => prev + 1);
      
      if (gameMode === 'smart-rotation-playing') {
        setSmartRotationScore(prev => prev + 10);
        setSmartRotationTotal(prev => prev + 10);
      }
      
      if (currentQuestion._id) {
        await recordCorrect(currentQuestion._id);
      }
    } else {
      setStreak(0);
      
      if (gameMode === 'smart-rotation-playing') {
        setSmartRotationTotal(prev => prev + 10);
      }
      
      if (gameMode === 'smart-rotation-playing' && currentSubject) {
        const updatedWeakSubjects = weakSubjects.map(subj => 
          subj.subject === currentSubject 
            ? { ...subj, wrongCount: subj.wrongCount + 1 }
            : subj
        );
        setWeakSubjects(updatedWeakSubjects);
      }
      
      if (currentQuestion._id) {
        await recordWrong(currentQuestion._id);
      }
    }
    
    setQuestionsAnswered(prev => prev + 1);
    setShowResult(true);
    
    setTimeout(() => {
      setFeedbackMessage('');
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrectAnswer(false);
    } else {
      if (gameMode === 'smart-rotation-playing') {
        handleNextSubjectInRotation();
      } else if (gameMode === 'free-roam-playing') {
        alert(`🎉 Amazing job, ${studentName}! You completed all questions!\n\nFinal Score: ${score}\n\nChoose another subject to keep shining! ✨`);
        setGameMode('free-roam');
      }
    }
  };

  const handleTimerComplete = () => {
    alert(`🎉 Congratulations ${studentName}! You completed your 2-hour study session! 🌟`);
  };

  const handleBreak = () => {
    alert('☕ Time for a 5-minute break! Stretch and relax, superstar! 💪');
  };

  const pointsToNextLevel = () => {
    const levelScores = {
      'Novice': 50,
      'Apprentice': 150,
      'Expert': 300,
      'Master': 500,
      'Grandmaster': Infinity
    };
    const currentScore = levelScores[level];
    return Math.max(0, currentScore - score);
  };

  // SMART ROTATION REQUIRED SCREEN
  if (gameMode === 'smart-rotation-required') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Welcome Banner */}
          <div className="text-center mb-6">
            <div className="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
              <span className="text-6xl">👩‍🎓✨</span>
            </div>
            <h1 className="text-4xl font-bold text-purple-700 mb-2">Welcome, Perez! 🌸</h1>
            <p className="text-pink-600 text-lg">Your learning adventure begins here!</p>
          </div>
          
          <FinancialTracker 
            balance={balance}
            todayEarned={todayEarned}
            todayPenalty={todayPenalty}
            weeklyTotal={weeklyTotal}
            thresholds={thresholds}
          />
          
          <StudyTimer 
            onComplete={handleTimerComplete}
            onBreak={handleBreak}
          />
          
          <div className="bg-gradient-to-r from-pink-200 to-purple-200 border-l-4 border-pink-500 p-6 rounded-2xl mb-6 shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">⭐⚡🌸</div>
              <h2 className="text-2xl font-bold text-purple-800 mb-2">Smart Rotation Required!</h2>
              <p className="text-purple-700 mb-4">
                Complete today's smart rotation to unlock all subjects, {studentName}! 🎀
                <br />This focuses on your weakest subjects to help you shine brighter!
              </p>
              <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
                <h3 className="font-bold text-pink-600 mb-2">Today's Subjects:</h3>
                {smartRotationSubjects.map((subject, index) => (
                  <div key={index} className="text-left text-gray-700 mb-2">
                    {index + 1}. {subject.subject.toUpperCase()} - {subject.reason}
                  </div>
                ))}
              </div>
              <button
                onClick={handleStartSmartRotation}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Start Smart Rotation ({smartRotationSubjects.length} subjects) 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SMART ROTATION PLAYING MODE
  if (gameMode === 'smart-rotation-playing') {
    if (loading || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">Loading questions...</h2>
              <p className="text-pink-600">Just a moment, {studentName}! ✨</p>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Student Name Badge */}
          <div className="text-right mb-2">
            <span className="bg-white rounded-full px-4 py-2 text-pink-600 font-semibold shadow-md">
              👩‍🎓 {studentName}'s Study Time
            </span>
          </div>
          
          <FinancialTracker 
            balance={balance}
            todayEarned={todayEarned}
            todayPenalty={todayPenalty}
            weeklyTotal={weeklyTotal}
            thresholds={thresholds}
          />
          
          <StudyTimer 
            onComplete={handleTimerComplete}
            onBreak={handleBreak}
          />
          
          <div className="bg-gradient-to-r from-purple-200 to-pink-200 border-l-4 border-purple-500 p-4 mb-4 rounded-xl shadow-md">
            <p className="text-purple-800 font-semibold">
              🎯 Smart Rotation: {currentSubjectIndex + 1} of {smartRotationSubjects.length}
            </p>
            <p className="text-sm text-pink-700">
              Current: {currentSubject?.toUpperCase()} 
            </p>
          </div>
          
          <ScoreBoard 
            score={score}
            streak={streak}
            level={level}
            questionsAnswered={questionsAnswered}
          />
          
          <LevelProgress 
            currentLevel={level}
            pointsToNextLevel={pointsToNextLevel()}
          />
          
          {feedbackMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center font-semibold animate-bounce ${
              isCorrectAnswer ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}>
              {feedbackMessage}
            </div>
          )}
          
          <QuestionCard
            question={currentQ}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            showResult={showResult}
            isCorrect={isCorrectAnswer}
          />
          
          <div className="mt-6 text-center text-sm text-purple-600">
            Question {currentQuestionIndex + 1} of {questions.length} 📚
          </div>
        </div>
      </div>
    );
  }

  // FREE ROAM - SUBJECT SELECTION SCREEN
  if (gameMode === 'free-roam') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Welcome Banner */}
          <div className="text-center mb-6">
            <div className="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
              <span className="text-6xl">🌟👩‍🎓🌸</span>
            </div>
            <h1 className="text-3xl font-bold text-purple-700 mb-1">Great job, Perez! 🎉</h1>
            <p className="text-pink-600">You completed your Smart Rotation! Now choose any subject to study! 📖</p>
          </div>
          
          <FinancialTracker 
            balance={balance}
            todayEarned={todayEarned}
            todayPenalty={todayPenalty}
            weeklyTotal={weeklyTotal}
            thresholds={thresholds}
          />
          
          <StudyTimer 
            onComplete={handleTimerComplete}
            onBreak={handleBreak}
          />
          
          {dailyScore !== null && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-xl shadow-md">
              <p className="text-green-800 font-semibold">
                ✅ Smart Rotation Complete! Today's Score: {dailyScore.toFixed(1)}%
              </p>
            </div>
          )}
          
          <SubjectSelector 
            onSelectSubject={handleSelectSubject}
            onSelectRandom={handleSelectRandom}
          />
        </div>
      </div>
    );
  }

  // FREE ROAM - PLAYING MODE
  if (gameMode === 'free-roam-playing') {
    if (loading || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-purple-700">Loading questions...</h2>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Student Name Badge */}
          <div className="text-right mb-2">
            <span className="bg-white rounded-full px-4 py-2 text-pink-600 font-semibold shadow-md">
              👩‍🎓 {studentName}'s Study Time
            </span>
          </div>
          
          <FinancialTracker 
            balance={balance}
            todayEarned={todayEarned}
            todayPenalty={todayPenalty}
            weeklyTotal={weeklyTotal}
            thresholds={thresholds}
          />
          
          <StudyTimer 
            onComplete={handleTimerComplete}
            onBreak={handleBreak}
          />
          
          <div className="bg-gradient-to-r from-green-200 to-emerald-200 border-l-4 border-green-500 p-4 mb-4 rounded-xl shadow-md">
            <p className="text-green-800 font-semibold">
              🎓 Free Roam Mode - Choose any subject you want!
            </p>
            <button
              onClick={() => setGameMode('free-roam')}
              className="mt-2 text-sm bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all"
            >
              ← Change Subject
            </button>
          </div>
          
          <ScoreBoard 
            score={score}
            streak={streak}
            level={level}
            questionsAnswered={questionsAnswered}
          />
          
          <LevelProgress 
            currentLevel={level}
            pointsToNextLevel={pointsToNextLevel()}
          />
          
          {feedbackMessage && (
            <div className={`mb-4 p-3 rounded-xl text-center font-semibold ${
              isCorrectAnswer ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}>
              {feedbackMessage}
            </div>
          )}
          
          <QuestionCard
            question={currentQ}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            showResult={showResult}
            isCorrect={isCorrectAnswer}
          />
          
          <div className="mt-6 text-center text-sm text-purple-600">
            Question {currentQuestionIndex + 1} of {questions.length} 📚
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GamePage;