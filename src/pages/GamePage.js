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
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const playSound = (type) => {
    try {
      const audio = new Audio();
      if (type === 'correct') audio.src = '/sounds/correct.mp3';
      else if (type === 'wrong') audio.src = '/sounds/wrong.mp3';
      else if (type === 'levelup') audio.src = '/sounds/levelup.mp3';
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
          setCurrentQuestion(subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)]);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
      setLoading(false);
    };
    loadQuestions();
  }, [selectedSubject]);
  
  const handleAnswer = async (answer) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    const deviceInfo = getDeviceInfo();
    
    if (isCorrect) playSound('correct');
    else playSound('wrong');
    
    try {
      const response = await api.post('/progress', {
        studentId: student.id,
        studentName: student.name,
        questionId: currentQuestion._id,
        subject: currentQuestion.subject,
        isCorrect,
        answerGiven: answer,
        correctAnswer: currentQuestion.correctAnswer,
        deviceInfo,
        sessionId
      });
      
      setScore(response.data.stats.totalScore);
      setKwachaBalance(response.data.stats.kwachaBalance);
      setLevel(response.data.stats.level);
      
      const subjectQuestions = questions.filter(q => q.subject === selectedSubject);
      const nextQuestion = subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)];
      setCurrentQuestion(nextQuestion);
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
      
      <div style={styles.gameGrid}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📚 Choose Subject</h3>
            <div style={styles.subjectButtons}>
              {['Mathematics', 'English', 'Science'].map(subj => (
                <button key={subj} onClick={() => setSelectedSubject(subj)} style={{...styles.subjectButton, background: selectedSubject === subj ? '#764ba2' : '#e0e0e0', color: selectedSubject === subj ? 'white' : '#333'}}>
                  {subj === 'Mathematics' && '🔢 '}{subj === 'English' && '📖 '}{subj === 'Science' && '🔬 '}{subj}
                </button>
              ))}
            </div>
          </div>
          
          <div style={styles.card}>
            {currentQuestion && (
              <div>
                <div style={styles.questionHeader}>
                  <span style={styles.subjectBadge}>{currentQuestion.subject}</span>
                  <span style={styles.difficultyBadge}>{currentQuestion.difficulty}</span>
                </div>
                <h2 style={styles.questionText}>{currentQuestion.text}</h2>
                <div style={styles.optionsGrid}>
                  {currentQuestion.options.map((option, idx) => (
                    <button key={idx} onClick={() => handleAnswer(option)} style={styles.optionButton}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⭐ Your Score</h3>
            <div style={styles.scoreValue}>{score}</div>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💰 Kwacha Balance</h3>
            <div style={styles.kwachaValue}>K {kwachaBalance}</div>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🎯 Current Level</h3>
            <div style={styles.levelValue}>{level}</div>
            <div style={styles.levelProgress}>
              <div style={{...styles.progressBar, width: `${Math.min((score / 1000) * 100, 100)}%`}}></div>
            </div>
          </div>
          
          {stats && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Your Progress</h3>
              <div style={styles.statRow}><span>Questions:</span><strong>{stats.questionsAnswered}</strong></div>
              <div style={styles.statRow}><span>Correct:</span><strong>{stats.correctAnswers}</strong></div>
              <div style={styles.statRow}><span>Accuracy:</span><strong>{stats.questionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0}%</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f0ff 0%, #ffe6f0 100%)', padding: '20px' },
  musicPlayer: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 },
  musicButton: { background: 'white', border: 'none', padding: '12px 20px', borderRadius: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', cursor: 'pointer', fontWeight: 'bold', color: '#764ba2' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '15px' },
  title: { color: '#764ba2', margin: 0, fontSize: '24px' },
  grade: { color: '#666', margin: '5px 0 0' },
  logoutButton: { background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  gameGrid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  cardTitle: { color: '#764ba2', marginTop: 0, marginBottom: '15px', fontSize: '18px' },
  subjectButtons: { display: 'flex', gap: '10px' },
  subjectButton: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  subjectBadge: { background: '#764ba2', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' },
  difficultyBadge: { background: '#4CAF50', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' },
  questionText: { fontSize: '22px', marginBottom: '25px', color: '#333' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  optionButton: { padding: '15px', background: '#f0f0f0', border: '2px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' },
  scoreValue: { fontSize: '48px', fontWeight: 'bold', color: '#ffd700', textAlign: 'center' },
  kwachaValue: { fontSize: '48px', fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  levelValue: { fontSize: '32px', fontWeight: 'bold', color: '#764ba2', textAlign: 'center' },
  levelProgress: { background: '#e0e0e0', height: '10px', borderRadius: '5px', marginTop: '10px', overflow: 'hidden' },
  progressBar: { background: '#764ba2', height: '100%', transition: 'width 0.3s' },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' },
  spinner: { width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.3)', borderTop: '5px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default GamePage;