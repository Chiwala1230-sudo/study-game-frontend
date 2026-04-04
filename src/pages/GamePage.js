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
      if (isMusicPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(e => console.log('Music error:', e));
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  
  useEffect(() => {
    audioRef.current = new Audio('/sounds/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
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
    
    setDisabled(true);
    
    let isCorrect = false;
    if (currentQuestion.correctAnswer) {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.correct !== undefined) {
      isCorrect = optionIndex === currentQuestion.correct;
    }
    
    const deviceInfo = getDeviceInfo();
    const correctAnswerText = currentQuestion.correctAnswer || currentQuestion.options[currentQuestion.correct];
    const explanation = currentQuestion.explanation || (isCorrect ? 'Great job!' : `The correct answer is: ${correctAnswerText}`);
    
    if (isCorrect) {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: true, 
        message: '+10 points! +5 Kwacha', 
        explanation: '' 
      });
      playSound('correct');
    } else {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: false, 
        message: 'Wrong answer', 
        explanation: explanation 
      });
      playSound('wrong');
    }
    
    setTimeout(() => setAnswerFeedback({ show: false, isCorrect: false, message: '', explanation: '' }), 2500);
    
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
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {/* Music Button */}
      <button onClick={toggleMusic} style={styles.musicButton}>
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {student.name}</h1>
          <p style={styles.grade}>Grade {student.grade || 7}</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>
      
      {/* Stats Row */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{score}</div>
          <div style={styles.statLabel}>Points</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>K{kwachaBalance}</div>
          <div style={styles.statLabel}>Kwacha</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{level}</div>
          <div style={styles.statLabel}>Level</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(score / 1000) * 100}%`}}></div>
        </div>
        <div style={styles.progressText}>{score}/1000 XP</div>
      </div>
      
      {/* Feedback Toast */}
      {answerFeedback.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: answerFeedback.isCorrect ? '#10b981' : '#ef4444'
        }}>
          <div style={styles.toastMessage}>{answerFeedback.message}</div>
          {answerFeedback.explanation && (
            <div style={styles.toastExplanation}>{answerFeedback.explanation}</div>
          )}
        </div>
      )}
      
      {/* Subject Selector */}
      <div style={styles.subjectsContainer}>
        {['Mathematics', 'English', 'Science'].map(subj => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            style={{
              ...styles.subjectButton,
              backgroundColor: selectedSubject === subj ? '#6366f1' : '#f3f4f6',
              color: selectedSubject === subj ? 'white' : '#4b5563'
            }}
          >
            {subj === 'Mathematics' && '📐'} {subj === 'English' && '📖'} {subj === 'Science' && '🔬'}
            <span style={{marginLeft: '8px'}}>{subj}</span>
          </button>
        ))}
      </div>
      
      {/* Question Card */}
      <div style={styles.questionCard}>
        <div style={styles.questionMeta}>
          <span style={styles.subjectTag}>{currentQuestion?.subject}</span>
          <span style={styles.difficultyTag}>{currentQuestion?.difficulty || 'Medium'}</span>
        </div>
        <h2 style={styles.questionText}>{currentQuestion?.question}</h2>
        <div style={styles.optionsGrid}>
          {currentQuestion?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option, idx)}
              disabled={disabled}
              style={styles.optionButton}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Progress Stats */}
      {stats && (
        <div style={styles.progressStats}>
          <div style={styles.progressStatItem}>
            <span>Questions</span>
            <strong>{stats.questionsAnswered}</strong>
          </div>
          <div style={styles.progressStatItem}>
            <span>Correct</span>
            <strong>{stats.correctAnswers}</strong>
          </div>
          <div style={styles.progressStatItem}>
            <span>Accuracy</span>
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
    background: '#f9fafb',
    padding: '20px',
    paddingBottom: '40px'
  },
  musicButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    background: 'white',
    border: '1px solid #e5e7eb',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 100
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  grade: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0'
  },
  logoutButton: {
    background: 'white',
    border: '1px solid #e5e7eb',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  statBox: {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#6366f1'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  progressContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  progressBar: {
    background: '#e5e7eb',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    background: '#6366f1',
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  progressText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    textAlign: 'right'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 20px',
    borderRadius: '12px',
    color: 'white',
    zIndex: 200,
    textAlign: 'center',
    maxWidth: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  toastMessage: {
    fontSize: '14px',
    fontWeight: '500'
  },
  toastExplanation: {
    fontSize: '12px',
    marginTop: '4px',
    opacity: 0.9
  },
  subjectsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  subjectButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  questionCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  questionMeta: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  subjectTag: {
    background: '#e0e7ff',
    color: '#6366f1',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  difficultyTag: {
    background: '#f3f4f6',
    color: '#6b7280',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#1f2937',
    margin: '0 0 20px',
    lineHeight: 1.4
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  optionButton: {
    width: '100%',
    padding: '14px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#1f2937'
  },
  progressStats: {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-around',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  progressStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f9fafb'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover {
    transform: scale(1.01);
  }
`;
document.head.appendChild(styleSheet);

export default GamePage;