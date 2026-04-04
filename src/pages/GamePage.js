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
  const [clickedOption, setClickedOption] = useState(null);
  
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
    if (!currentQuestion) return;
    
    setClickedOption(optionIndex);
    
    let isCorrect = false;
    if (currentQuestion.correctAnswer) {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.correct !== undefined) {
      isCorrect = optionIndex === currentQuestion.correct;
    }
    
    const deviceInfo = getDeviceInfo();
    const correctAnswerText = currentQuestion.correctAnswer || currentQuestion.options[currentQuestion.correct];
    const explanation = currentQuestion.explanation || (isCorrect ? 'Great job!' : `The correct answer is: ${correctAnswerText}`);
    
    // Show feedback with explanation
    if (isCorrect) {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: true, 
        message: '✅ CORRECT! +10 points, +5 Kwacha', 
        explanation: explanation 
      });
      playSound('correct');
    } else {
      setAnswerFeedback({ 
        show: true, 
        isCorrect: false, 
        message: `❌ WRONG!`, 
        explanation: explanation 
      });
      playSound('wrong');
    }
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setAnswerFeedback({ show: false, isCorrect: false, message: '', explanation: '' });
      setClickedOption(null);
    }, 3000);
    
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
      
      const subjectQuestions = questions.filter(q => q.subject === selectedSubject);
      if (subjectQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * subjectQuestions.length);
        setCurrentQuestion(subjectQuestions[randomIndex]);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading your adventure...</p>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.musicPlayer}>
        <button onClick={toggleMusic} style={styles.musicButton}>
          {isMusicPlaying ? '🔊 Music On' : '🔇 Music Off'}
        </button>
      </div>
      
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎓 Welcome, {student.name}!</h1>
          <p style={styles.grade}>Grade {student.grade || 7} Student</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>🚪 Logout</button>
      </div>
      
      {/* Stats Cards - Better layout for mobile */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>⭐ Score</div>
          <div style={styles.statValue}>{score}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>💰 Kwacha</div>
          <div style={styles.statValue}>K {kwachaBalance}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>🎯 Level</div>
          <div style={styles.statValue}>{level}</div>
        </div>
      </div>
      
      {/* Level Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>Progress to Grandmaster</div>
        <div style={styles.progressBarBg}>
          <div style={{...styles.progressBarFill, width: `${Math.min((score / 1000) * 100, 100)}%`}}></div>
        </div>
        <div style={styles.progressText}>{score}/1000 points</div>
      </div>
      
      {/* Feedback Message with Explanation */}
      {answerFeedback.show && (
        <div style={{
          ...styles.feedback,
          backgroundColor: answerFeedback.isCorrect ? '#4CAF50' : '#f44336'
        }}>
          <div style={styles.feedbackMessage}>{answerFeedback.message}</div>
          <div style={styles.feedbackExplanation}>{answerFeedback.explanation}</div>
        </div>
      )}
      
      {/* Subject Selector */}
      <div style={styles.subjectContainer}>
        <div style={styles.subjectTitle}>📚 Choose Subject</div>
        <div style={styles.subjectButtons}>
          {['Mathematics', 'English', 'Science'].map(subj => (
            <button 
              key={subj} 
              onClick={() => setSelectedSubject(subj)} 
              style={{
                ...styles.subjectButton, 
                background: selectedSubject === subj ? '#764ba2' : 'white',
                color: selectedSubject === subj ? 'white' : '#764ba2',
                border: selectedSubject === subj ? 'none' : '2px solid #764ba2'
              }}
            >
              {subj === 'Mathematics' && '🔢 '}{subj === 'English' && '📖 '}{subj === 'Science' && '🔬 '}{subj}
            </button>
          ))}
        </div>
      </div>
      
      {/* Question Card */}
      <div style={styles.questionCard}>
        {currentQuestion && (
          <>
            <div style={styles.questionHeader}>
              <span style={styles.subjectBadge}>{currentQuestion.subject}</span>
              <span style={styles.difficultyBadge}>{currentQuestion.difficulty || 'Medium'}</span>
            </div>
            <h2 style={styles.questionText}>{currentQuestion.question}</h2>
            <div style={styles.optionsGrid}>
              {currentQuestion.options.map((option, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(option, idx)} 
                  style={{
                    ...styles.optionButton,
                    backgroundColor: clickedOption === idx ? (answerFeedback.isCorrect ? '#4CAF50' : '#f44336') : '#f0f0f0',
                    color: clickedOption === idx ? 'white' : '#333',
                    transform: clickedOption === idx ? 'scale(0.98)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (clickedOption !== idx) e.target.style.backgroundColor = '#764ba2';
                    if (clickedOption !== idx) e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    if (clickedOption !== idx) e.target.style.backgroundColor = '#f0f0f0';
                    if (clickedOption !== idx) e.target.style.color = '#333';
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Progress Stats */}
      {stats && (
        <div style={styles.statsCard}>
          <h3 style={styles.statsTitle}>📊 Your Progress</h3>
          <div style={styles.statsGrid}>
            <div>Questions Answered:</div><strong>{stats.questionsAnswered}</strong>
            <div>Correct Answers:</div><strong>{stats.correctAnswers}</strong>
            <div>Accuracy:</div><strong>{stats.questionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0}%</strong>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #f5f0ff 0%, #ffe6f0 100%)', 
    padding: '20px' 
  },
  musicPlayer: { 
    position: 'fixed', 
    bottom: '20px', 
    right: '20px', 
    zIndex: 1000 
  },
  musicButton: { 
    background: 'white', 
    border: 'none', 
    padding: '12px 20px', 
    borderRadius: '25px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    color: '#764ba2' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px', 
    padding: '15px 20px', 
    background: 'white', 
    borderRadius: '15px', 
    flexWrap: 'wrap', 
    gap: '10px' 
  },
  title: { 
    color: '#764ba2', 
    margin: 0, 
    fontSize: '20px' 
  },
  grade: { 
    color: '#666', 
    margin: '5px 0 0', 
    fontSize: '14px' 
  },
  logoutButton: { 
    background: '#ff6b6b', 
    color: 'white', 
    border: 'none', 
    padding: '8px 16px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#764ba2'
  },
  progressContainer: {
    background: 'white',
    borderRadius: '15px',
    padding: '15px',
    marginBottom: '20px'
  },
  progressLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  progressBarBg: {
    background: '#e0e0e0',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressBarFill: {
    background: '#764ba2',
    height: '100%',
    transition: 'width 0.3s'
  },
  progressText: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
    textAlign: 'right'
  },
  feedback: {
    color: 'white',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  feedbackMessage: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  feedbackExplanation: {
    fontSize: '14px',
    opacity: 0.95
  },
  subjectContainer: {
    background: 'white',
    borderRadius: '15px',
    padding: '15px',
    marginBottom: '20px'
  },
  subjectTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#764ba2',
    marginBottom: '12px'
  },
  subjectButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  subjectButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    minWidth: '100px',
    transition: 'all 0.3s'
  },
  questionCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  subjectBadge: {
    background: '#764ba2',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  difficultyBadge: {
    background: '#4CAF50',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px'
  },
  questionText: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#333',
    lineHeight: 1.4
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  optionButton: {
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    fontWeight: '500'
  },
  statsCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginTop: '10px'
  },
  statsTitle: {
    color: '#764ba2',
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  loading: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white' 
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '5px solid rgba(255,255,255,0.3)', 
    borderTop: '5px solid white', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 768px) {
  div[style*="grid-template-columns: 1fr 1fr"] { 
    grid-template-columns: 1fr !important; 
  }
  button[style*="padding: 14px"] { 
    padding: 12px !important; 
    font-size: 13px !important; 
  }
  h2[style*="font-size: 20px"] { 
    font-size: 18px !important; 
  }
}
`;
document.head.appendChild(styleSheet);

export default GamePage;