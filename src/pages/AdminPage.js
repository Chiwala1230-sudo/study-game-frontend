import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminPage({ onBack }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [newQuestion, setNewQuestion] = useState({ subject: 'Mathematics', text: '', options: ['', '', '', ''], correctAnswer: '' });
  
  const handleLogin = async () => {
    try {
      const response = await api.post('/admin/login', { password });
      if (response.data.success) {
        setIsAuthenticated(true);
        loadData();
      } else alert('Wrong password');
    } catch (error) { alert('Login failed'); }
  };
  
  const loadData = async () => {
    try {
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);
      const progressRes = await api.get('/all-progress');
      setAllProgress(progressRes.data);
      const questionsRes = await api.get('/questions');
      setQuestions(questionsRes.data);
    } catch (error) { console.error('Error loading data:', error); }
  };
  
  const deleteProgress = async (progressId) => {
    if (window.confirm('Delete this progress record?')) {
      await api.delete(`/progress/${progressId}`);
      loadData();
    }
  };
  
  const deleteStudentProgress = async (studentId) => {
    if (window.confirm('Delete ALL progress for this student?')) {
      await api.delete(`/progress/student/${studentId}`);
      loadData();
    }
  };
  
  const deleteAllData = async () => {
    if (window.confirm('⚠️ DELETE ALL DATA? This cannot be undone!')) {
      await api.delete('/delete-all-data');
      loadData();
    }
  };
  
  const addQuestion = async () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
      alert('Please fill in question and answer');
      return;
    }
    await api.post('/questions', newQuestion);
    setNewQuestion({ subject: 'Mathematics', text: '', options: ['', '', '', ''], correctAnswer: '' });
    loadData();
  };
  
  const deleteQuestion = async (questionId) => {
    if (window.confirm('Delete this question?')) {
      await api.delete(`/questions/${questionId}`);
      loadData();
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h2>👑 Admin Login</h2>
          <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
          <button onClick={handleLogin} style={styles.button}>Login</button>
          <button onClick={onBack} style={styles.backButton}>Back to Game</button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.adminHeader}>
        <h1>👑 Admin Panel</h1>
        <button onClick={onBack} style={styles.backButton}>← Back to Game</button>
      </div>
      
      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('students')} style={activeTab === 'students' ? styles.activeTab : styles.tab}>📚 Students</button>
        <button onClick={() => setActiveTab('progress')} style={activeTab === 'progress' ? styles.activeTab : styles.tab}>📊 Progress & Devices</button>
        <button onClick={() => setActiveTab('questions')} style={activeTab === 'questions' ? styles.activeTab : styles.tab}>📝 Questions</button>
        <button onClick={() => setActiveTab('delete')} style={activeTab === 'delete' ? styles.activeTab : styles.tab}>🗑️ Delete Data</button>
      </div>
      
      {activeTab === 'students' && (
        <div style={styles.section}>
          <h2>📚 All Students</h2>
          <div style={styles.studentGrid}>
            {students.map(student => (
              <div key={student._id} style={styles.studentCard}>
                <h3>{student.name || student.username}</h3>
                <p>Username: {student.username}</p>
                <p>Grade: {student.grade || '7'}</p>
                {student.stats && (
                  <>
                    <p>⭐ Score: {student.stats.totalScore}</p>
                    <p>💰 Kwacha: {student.stats.kwachaBalance}</p>
                    <p>🎯 Level: {student.stats.level}</p>
                    <p>📊 Questions: {student.stats.questionsAnswered}</p>
                  </>
                )}
                <button onClick={() => deleteStudentProgress(student._id)} style={styles.deleteButton}>Delete Student Progress</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'progress' && (
        <div style={styles.section}>
          <h2>📊 Student Progress & Device Tracking</h2>
          <div style={styles.progressList}>
            {allProgress.map(progress => (
              <div key={progress._id} style={styles.progressItem}>
                <div style={styles.progressHeader}>
                  <strong>{progress.studentName || progress.studentId?.username}</strong>
                  <span style={progress.isCorrect ? styles.correct : styles.wrong}>
                    {progress.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
                <div><strong>Subject:</strong> {progress.subject}</div>
                <div><strong>Answer:</strong> {progress.answerGiven} (Correct: {progress.correctAnswer})</div>
                <div style={styles.deviceInfo}>
                  📱 Device: {progress.deviceInfo?.deviceType || 'Unknown'} | 🌐 Browser: {progress.deviceInfo?.browser || 'Unknown'} | 💻 OS: {progress.deviceInfo?.os || 'Unknown'}
                </div>
                <div style={styles.timestamp}>🕐 {new Date(progress.timestamp).toLocaleString()}</div>
                <button onClick={() => deleteProgress(progress._id)} style={styles.smallDeleteButton}>Delete Record</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'questions' && (
        <div style={styles.section}>
          <h2>📝 Manage Questions</h2>
          <div style={styles.addQuestion}>
            <h3>Add New Question</h3>
            <select value={newQuestion.subject} onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} style={styles.input}>
              <option>Mathematics</option><option>English</option><option>Science</option>
            </select>
            <input placeholder="Question text" value={newQuestion.text} onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})} style={styles.input} />
            {newQuestion.options.map((opt, idx) => (
              <input key={idx} placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => {
                const newOpts = [...newQuestion.options];
                newOpts[idx] = e.target.value;
                setNewQuestion({...newQuestion, options: newOpts});
              }} style={styles.input} />
            ))}
            <input placeholder="Correct answer" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} style={styles.input} />
            <button onClick={addQuestion} style={styles.addButton}>+ Add Question</button>
          </div>
          
          <div style={styles.questionList}>
            {questions.map(q => (
              <div key={q._id} style={styles.questionItem}>
                <div><strong>[{q.subject}]</strong> {q.text}<div style={styles.correctAnswer}>✓ {q.correctAnswer}</div></div>
                <button onClick={() => deleteQuestion(q._id)} style={styles.smallDeleteButton}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'delete' && (
        <div style={styles.section}>
          <h2>⚠️ Delete Data (Admin Only)</h2>
          <div style={styles.deleteCard}>
            <h3>Delete All Progress Records</h3>
            <p>This will remove ALL progress records for ALL students.</p>
            <button onClick={deleteAllData} style={styles.dangerButton}>Delete All Progress Data</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', padding: '20px' },
  loginBox: { maxWidth: '400px', margin: '100px auto', padding: '40px', background: 'white', borderRadius: '10px', textAlign: 'center' },
  adminHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 20px', borderRadius: '10px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', background: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  activeTab: { padding: '10px 20px', background: '#764ba2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  section: { background: 'white', padding: '20px', borderRadius: '10px' },
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' },
  studentCard: { border: '1px solid #e0e0e0', padding: '15px', borderRadius: '10px', background: '#fafafa' },
  progressList: { maxHeight: '600px', overflowY: 'auto', marginTop: '15px' },
  progressItem: { border: '1px solid #e0e0e0', padding: '10px', marginBottom: '10px', borderRadius: '5px', background: '#fafafa' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' },
  correct: { color: 'green', fontWeight: 'bold' },
  wrong: { color: 'red', fontWeight: 'bold' },
  deviceInfo: { fontSize: '12px', color: '#666', marginTop: '8px', padding: '5px', background: '#f0f0f0', borderRadius: '5px' },
  timestamp: { fontSize: '11px', color: '#999', marginTop: '5px' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  button: { background: '#764ba2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
  backButton: { background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  deleteButton: { background: '#ff4444', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
  smallDeleteButton: { background: '#ff4444', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', marginTop: '5px' },
  dangerButton: { background: '#d32f2f', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  deleteCard: { border: '2px solid #ff4444', padding: '20px', borderRadius: '10px', textAlign: 'center', background: '#fff3f3' },
  addQuestion: { padding: '20px', background: '#f9f9f9', borderRadius: '10px', marginBottom: '20px' },
  addButton: { background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' },
  questionList: { maxHeight: '400px', overflowY: 'auto' },
  questionItem: { padding: '10px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  correctAnswer: { fontSize: '12px', color: '#4CAF50', marginTop: '3px' }
};

export default AdminPage;