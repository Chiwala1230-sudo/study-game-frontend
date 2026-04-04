import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function GamePage({ student, token, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [score, setScore] = useState(0);
  const [kwachaBalance, setKwachaBalance] = useState(0);
  const [level, setLevel] = useState('Novice');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [answerFeedback, setAnswerFeedback] = useState({ show: false, isCorrect: false, message: '', explanation: '' });
  const [selectedOption, setSelectedOption] = useState(null);
  const [disabled, setDisabled] = useState(false);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const playSound = (type) => {
    try {
      const audio = new Audio();
      if (type === 'correct') audio.src = '/sounds/correct.mp3';
      else if (type === 'wrong') audio.src = '/sounds/wrong.mp3';
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound error:', e));
    } catch(e) { console.log('Sound error:', e); }
  };
  
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Music error:', e));
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  
  useEffect(() => {
    audioRef.current = new Audio('/sounds/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    // Don't autoplay - user must click music button first
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);
  
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let deviceType = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';
    
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) deviceType = 'Mobile';
    else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return { deviceType, browser, os, userAgent };
  };
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get(`/stats/${student.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScore(response.data.totalScore);
        setKwachaBalance(response.data.kwachaBalance);
        setLevel(response.data.level);
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, [student.id, token]);
  
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/questions');
        setQuestions(response.data);
        const subjectQuestions = response.data.filter(q => q.subject === selectedSubject);
        if (subjectQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * subjectQuestions.length);
          setCurrentQuestion(subjectQuestions[randomIndex]);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
      setLoading(false);
    };
    loadQuestions();
  }, [selectedSubject]);
  
  const handleAnswer = async (answer, optionIndex) => {
    if (!currentQuestion || disabled) return;
    
    setSelectedOption(optionIndex);
    setDisabled(true);
    
    let isCorrect = false;
    if (currentQuestion.correctAnswer) {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.correct !== undefined) {
      isCorrect = optionIndex === currentQuestion.correct;
    }
    
    const deviceInfo = getDeviceInfo();
    const correctAnswerText = currentQuestion.correctAnswer || currentQuestion.options[currentQuestion.correct];
    const explanation = currentQuestion.explanation || (isCorrect ? '✨ Amazing! ✨' : `💖 The correct answer is: ${correctAnswerText}`);
    
    if (isCorrect) {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: true, 
        message: '🎉 PERFECT! 🎉 +10 points +5 Kwacha', 
        explanation: '🌸 You\'re so smart! 🌸' 
      });
      playSound('correct');
    } else {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: false, 
        message: '💕 Aww, next time! 💕', 
        explanation: explanation 
      });
      playSound('wrong');
    }
    
    setTimeout(() => {
      setAnswerFeedback({ show: false, isCorrect: false, message: '', explanation: '' });
      setSelectedOption(null);
    }, 2500);
    
    try {
      const response = await api.post('/progress', {
        studentId: student.id,
        studentName: student.name,
        questionId: currentQuestion._id,
        subject: currentQuestion.subject,
        isCorrect,
        answerGiven: answer,
        correctAnswer: correctAnswerText,
        deviceInfo,
        sessionId
      });
      
      setScore(response.data.stats.totalScore);
      setKwachaBalance(response.data.stats.kwachaBalance);
      setLevel(response.data.stats.level);
      
      setTimeout(async () => {
        const subjectQuestions = questions.filter(q => q.subject === selectedSubject);
        if (subjectQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * subjectQuestions.length);
          setCurrentQuestion(subjectQuestions[randomIndex]);
        }
        setDisabled(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setDisabled(false);
    }
  };
  
  const getLevelEmoji = () => {
    if (level === 'Novice') return '🌱';
    if (level === 'Beginner') return '🌸';
    if (level === 'Intermediate') return '⭐';
    if (level === 'Expert') return '💎';
    if (level === 'Master') return '👑';
    if (level === 'Grandmaster') return '🌟';
    return '💖';
  };
  
  const getQuestionText = (q) => {
    if (!q) return 'Loading question...';
    return q.question || q.text || 'Question text not available';
  };
  
  const allSubjects = [
    { name: 'Mathematics', emoji: '🔢', icon: '➕' },
    { name: 'English', emoji: '📚', icon: '✨' },
    { name: 'Science', emoji: '🔬', icon: '🧪' },
    { name: 'Social Studies', emoji: '🌍', icon: '🗺️' },
    { name: 'Creative Arts', emoji: '🎨', icon: '🖌️' }
  ];
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>🌸 Loading your magical adventure... 🌸</p>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <button onClick={toggleMusic} style={styles.musicButton}>
        {isMusicPlaying ? '🎵' : '🎵🔇'}
      </button>
      
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🌸 Welcome, {student.name}! 🌸</h1>
          <p style={styles.grade}>✨ Grade {student.grade || 7} Star Student ✨</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>🚪 Goodbye</button>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>⭐</div>
          <div style={styles.statValue}>{score}</div>
          <div style={styles.statLabel}>Sparkle Points</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>💰</div>
          <div style={styles.statValue}>K{kwachaBalance}</div>
          <div style={styles.statLabel}>Kwacha</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statEmoji}>{getLevelEmoji()}</div>
          <div style={styles.statValue}>{level}</div>
          <div style={styles.statLabel}>Level</div>
        </div>
      </div>
      
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>💖 Journey to Grandmaster 💖</div>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(score / 1000) * 100}%`}}></div>
        </div>
        <div style={styles.progressText}>{score}/1000 Sparkle Points ✨</div>
      </div>
      
      {answerFeedback.show && (
        <div style={{
          ...styles.toast,
          background: answerFeedback.isCorrect 
            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }}>
          <div style={styles.toastMessage}>{answerFeedback.message}</div>
          {answerFeedback.explanation && (
            <div style={styles.toastExplanation}>{answerFeedback.explanation}</div>
          )}
        </div>
      )}
      
      <div style={styles.subjectsContainer}>
        {allSubjects.map(subj => (
          <button
            key={subj.name}
            onClick={() => setSelectedSubject(subj.name)}
            style={{
              ...styles.subjectButton,
              background: selectedSubject === subj.name 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'white',
              color: selectedSubject === subj.name ? 'white' : '#d63384',
              border: selectedSubject === subj.name ? 'none' : '2px solid #f0a6ca'
            }}
          >
            {subj.emoji} {subj.name} {subj.icon}
          </button>
        ))}
      </div>
      
      <div style={styles.questionCard}>
        {currentQuestion ? (
          <>
            <div style={styles.questionMeta}>
              <span style={styles.subjectTag}>💜 {currentQuestion.subject} 💜</span>
              <span style={styles.difficultyTag}>
                {currentQuestion.difficulty === 'easy' && '🌟 Easy Peasy 🌟'}
                {currentQuestion.difficulty === 'medium' && '⭐ Getting There ⭐'}
                {currentQuestion.difficulty === 'hard' && '💪 Challenge Mode 💪'}
                {!currentQuestion.difficulty && '⭐ Getting There ⭐'}
              </span>
            </div>
            <h2 style={styles.questionText}>{getQuestionText(currentQuestion)}</h2>
            <div style={styles.optionsGrid}>
              {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option, idx)}
                  disabled={disabled}
                  style={{
                    ...styles.optionButton,
                    background: selectedOption === idx 
                      ? (answerFeedback.isCorrect ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)')
                      : 'white',
                    border: selectedOption === idx ? '2px solid #f093fb' : '2px solid #f0a6ca',
                    transform: selectedOption === idx ? 'scale(0.98)' : 'scale(1)'
                  }}
                >
                  <span style={styles.optionLetter}>
                    {idx === 0 && '🌸'}
                    {idx === 1 && '💕'}
                    {idx === 2 && '⭐'}
                    {idx === 3 && '💎'}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={styles.noQuestion}>
            <p>🌸 No questions available for {selectedSubject} yet! 🌸</p>
            <p>Ask your teacher to add some questions in the Admin Panel.</p>
          </div>
        )}
      </div>
      
      {stats && (
        <div style={styles.progressStats}>
          <div style={styles.progressStatItem}>
            <span>📝 Questions</span>
            <strong>{stats.questionsAnswered}</strong>
          </div>
          <div style={styles.progressStatItem}>
            <span>✅ Correct</span>
            <strong>{stats.correctAnswers}</strong>
          </div>
          <div style={styles.progressStatItem}>
            <span>🎯 Accuracy</span>
            <strong>{stats.questionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0}%</strong>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #ffe9f4 0%, #ffe0f0 50%, #ffd6ea 100%)', 
    padding: '20px', 
    paddingBottom: '40px' 
  },
  musicButton: { 
    position: 'fixed', 
    bottom: '20px', 
    right: '20px', 
    width: '50px', 
    height: '50px', 
    borderRadius: '25px', 
    background: 'white', 
    border: '2px solid #f0a6ca', 
    fontSize: '20px', 
    cursor: 'pointer', 
    boxShadow: '0 4px 15px rgba(240, 166, 202, 0.3)', 
    zIndex: 100, 
    color: '#d63384' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  title: { 
    fontSize: '20px', 
    fontWeight: '600', 
    color: '#d63384', 
    margin: 0 
  },
  grade: { 
    fontSize: '14px', 
    color: '#e86f9c', 
    margin: '4px 0 0' 
  },
  logoutButton: { 
    background: 'white', 
    border: '2px solid #f0a6ca', 
    padding: '8px 16px', 
    borderRadius: '25px', 
    fontSize: '14px', 
    cursor: 'pointer', 
    color: '#d63384', 
    fontWeight: '500' 
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '12px', 
    marginBottom: '20px' 
  },
  statBox: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '16px', 
    textAlign: 'center', 
    boxShadow: '0 4px 15px rgba(240, 166, 202, 0.2)', 
    border: '1px solid #f0a6ca' 
  },
  statEmoji: { 
    fontSize: '28px', 
    marginBottom: '5px' 
  },
  statValue: { 
    fontSize: '28px', 
    fontWeight: '700', 
    color: '#d63384' 
  },
  statLabel: { 
    fontSize: '12px', 
    color: '#e86f9c', 
    marginTop: '4px' 
  },
  progressContainer: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '15px', 
    marginBottom: '24px', 
    boxShadow: '0 4px 15px rgba(240, 166, 202, 0.2)', 
    border: '1px solid #f0a6ca' 
  },
  progressLabel: { 
    fontSize: '12px', 
    color: '#d63384', 
    marginBottom: '8px', 
    textAlign: 'center', 
    fontWeight: '500' 
  },
  progressBar: { 
    background: '#ffe0f0', 
    height: '10px', 
    borderRadius: '5px', 
    overflow: 'hidden' 
  },
  progressFill: { 
    background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)', 
    height: '100%', 
    borderRadius: '5px', 
    transition: 'width 0.3s' 
  },
  progressText: { 
    fontSize: '11px', 
    color: '#e86f9c', 
    marginTop: '8px', 
    textAlign: 'right' 
  },
  toast: { 
    position: 'fixed', 
    top: '80px', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    padding: '15px 25px', 
    borderRadius: '50px', 
    color: 'white', 
    zIndex: 200, 
    textAlign: 'center', 
    maxWidth: '90%', 
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)', 
    fontWeight: '500' 
  },
  toastMessage: { 
    fontSize: '15px', 
    fontWeight: '600' 
  },
  toastExplanation: { 
    fontSize: '12px', 
    marginTop: '5px', 
    opacity: 0.95 
  },
  subjectsContainer: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
    gap: '10px', 
    marginBottom: '20px' 
  },
  subjectButton: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '10px', 
    borderRadius: '30px', 
    fontSize: '13px', 
    fontWeight: '500', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    boxShadow: '0 2px 8px rgba(240, 166, 202, 0.2)', 
    gap: '5px', 
    whiteSpace: 'nowrap' 
  },
  questionCard: { 
    background: 'white', 
    borderRadius: '30px', 
    padding: '25px', 
    boxShadow: '0 8px 25px rgba(240, 166, 202, 0.2)', 
    marginBottom: '20px', 
    border: '1px solid #f0a6ca' 
  },
  questionMeta: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '16px', 
    flexWrap: 'wrap' 
  },
  subjectTag: { 
    background: '#ffe0f0', 
    color: '#d63384', 
    padding: '5px 15px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  difficultyTag: { 
    background: '#f0a6ca20', 
    color: '#e86f9c', 
    padding: '5px 15px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  questionText: { 
    fontSize: '18px', 
    fontWeight: '500', 
    color: '#4a4a4a', 
    margin: '0 0 20px', 
    lineHeight: 1.4 
  },
  optionsGrid: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  optionButton: { 
    width: '100%', 
    padding: '14px', 
    borderRadius: '50px', 
    fontSize: '14px', 
    textAlign: 'left', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    color: '#4a4a4a', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    fontWeight: '500' 
  },
  optionLetter: { 
    fontSize: '16px', 
    width: '30px' 
  },
  progressStats: { 
    background: 'white', 
    borderRadius: '25px', 
    padding: '16px', 
    display: 'flex', 
    justifyContent: 'space-around', 
    boxShadow: '0 4px 15px rgba(240, 166, 202, 0.2)', 
    border: '1px solid #f0a6ca' 
  },
  progressStatItem: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '5px', 
    color: '#d63384', 
    fontSize: '12px' 
  },
  loading: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #ffe9f4 0%, #ffe0f0 100%)' 
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #f0a6ca', 
    borderTop: '3px solid #d63384', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  loadingText: { 
    marginTop: '15px', 
    color: '#d63384', 
    fontSize: '16px' 
  },
  noQuestion: {
    textAlign: 'center',
    padding: '40px',
    color: '#d63384'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover {
    transform: scale(1.02);
  }
  @media (max-width: 600px) {
    button[style*="white-space: nowrap"] {
      white-space: normal !important;
      font-size: 11px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default GamePage;