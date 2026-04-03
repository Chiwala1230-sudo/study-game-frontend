import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    subject: 'Mathematics',
    topic: '',
    difficulty: 'easy',
    explanation: '',
    simpleTip: ''
  });
  
  const [batchQuestions, setBatchQuestions] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const ADMIN_PASSWORD = 'admin123';
  const API_URL = 'https://study-game-backend-1-production.up.railway.app/api/admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'dashboard') {
          const statsRes = await axios.get(`${API_URL}/statistics`);
          if (statsRes.data.success) setStatistics(statsRes.data.data);
        } else if (activeTab === 'questions') {
          const questionsRes = await axios.get(`${API_URL}/questions`);
          if (questionsRes.data.success) setQuestions(questionsRes.data.data);
        } else if (activeTab === 'progress') {
          const progressRes = await axios.get(`${API_URL}/progress`);
          if (progressRes.data.success) setProgress(progressRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ text: 'Error fetching data', type: 'error' });
      }
      setLoading(false);
    };

    if (isLoggedIn && activeTab !== 'add') {
      fetchData();
    }
  }, [isLoggedIn, activeTab, API_URL]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setMessage({ text: 'Login successful!', type: 'success' });
    } else {
      setMessage({ text: 'Wrong password!', type: 'error' });
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/questions`, newQuestion);
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setNewQuestion({
          question: '',
          options: ['', '', '', ''],
          correct: 0,
          subject: 'Mathematics',
          topic: '',
          difficulty: 'easy',
          explanation: '',
          simpleTip: ''
        });
        const questionsRes = await axios.get(`${API_URL}/questions`);
        if (questionsRes.data.success) setQuestions(questionsRes.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Error adding question', type: 'error' });
    }
    setLoading(false);
  };

  const handleBatchUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let questionsToAdd;
      try {
        questionsToAdd = JSON.parse(batchQuestions);
      } catch {
        setMessage({ text: 'Invalid JSON format!', type: 'error' });
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${API_URL}/questions/batch`, { questions: questionsToAdd });
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        setBatchQuestions('');
        const questionsRes = await axios.get(`${API_URL}/questions`);
        if (questionsRes.data.success) setQuestions(questionsRes.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Error uploading batch', type: 'error' });
    }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await axios.delete(`${API_URL}/questions/${id}`);
        if (response.data.success) {
          setMessage({ text: response.data.message, type: 'success' });
          const questionsRes = await axios.get(`${API_URL}/questions`);
          if (questionsRes.data.success) setQuestions(questionsRes.data.data);
        }
      } catch (error) {
        setMessage({ text: 'Error deleting question', type: 'error' });
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center mb-6">🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
              Login
            </button>
          </form>
          {message.text && (
            <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">📊 Admin Dashboard</h1>
          <p className="text-sm opacity-90">Manage questions, view student progress, and track performance</p>
        </div>
      </div>
      
      <div className="bg-white shadow-md">
        <div className="container mx-auto flex flex-wrap gap-2 p-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>📈 Dashboard</button>
          <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>📚 Manage Questions</button>
          <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>➕ Add Question</button>
          <button onClick={() => setActiveTab('batch')} className={`px-4 py-2 rounded ${activeTab === 'batch' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>📦 Batch Upload</button>
          <button onClick={() => setActiveTab('progress')} className={`px-4 py-2 rounded ${activeTab === 'progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>📊 Student Progress</button>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
            <button onClick={() => setMessage({ text: '', type: '' })} className="float-right">✖</button>
          </div>
        )}
        
        {activeTab === 'dashboard' && statistics && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold">{statistics.totalQuestions}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold">{statistics.totalAnswers}</div>
                <div className="text-gray-600">Questions Answered</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold">{statistics.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold">{statistics.averageTimePerQuestion}s</div>
                <div className="text-gray-600">Avg Time/Question</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📊 Performance by Subject</h2>
              <div className="space-y-3">
                {statistics.subjectStats && statistics.subjectStats.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{subject._id}</span>
                      <span>{subject.correct} / {subject.total} correct ({((subject.correct/subject.total)*100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(subject.correct/subject.total)*100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'questions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">📚 All Questions ({questions.length})</h2>
              <button onClick={() => window.location.reload()} className="bg-blue-500 text-white px-4 py-2 rounded">Refresh</button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((q, index) => (
                <div key={q._id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <span className="text-gray-500 text-sm">#{index + 1}</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{q.subject}</span>
                      <p className="font-semibold mt-2">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        {q.options.map((opt, i) => (
                          <div key={i} className={i === q.correct ? "text-green-600 font-semibold" : "text-gray-600"}>
                            {String.fromCharCode(65 + i)}. {opt} {i === q.correct && "✓"}
                          </div>
                        ))}
                      </div>
                      {q.explanation && <p className="text-sm text-gray-600 mt-2">📚 {q.explanation}</p>}
                    </div>
                    <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-500 hover:text-red-700 ml-4">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">➕ Add New Question</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Question *</label>
                <input type="text" value={newQuestion.question} onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})} required className="w-full p-3 border rounded-lg" />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Options *</label>
                {newQuestion.options.map((opt, i) => (
                  <input key={i} type="text" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => {
                    const newOpts = [...newQuestion.options];
                    newOpts[i] = e.target.value;
                    setNewQuestion({...newQuestion, options: newOpts});
                  }} required className="w-full p-3 border rounded-lg mb-2" />
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Correct Answer *</label>
                  <select value={newQuestion.correct} onChange={(e) => setNewQuestion({...newQuestion, correct: parseInt(e.target.value)})} className="w-full p-3 border rounded-lg">
                    <option value={0}>A - {newQuestion.options[0]}</option>
                    <option value={1}>B - {newQuestion.options[1]}</option>
                    <option value={2}>C - {newQuestion.options[2]}</option>
                    <option value={3}>D - {newQuestion.options[3]}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Subject *</label>
                  <select value={newQuestion.subject} onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})} className="w-full p-3 border rounded-lg">
                    <option>Mathematics</option>
                    <option>English</option>
                    <option>Science</option>
                    <option>Social Studies</option>
                    <option>Creative and Technology Studies</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Explanation (Why this answer is correct) *</label>
                <textarea value={newQuestion.explanation} onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})} required rows="3" className="w-full p-3 border rounded-lg" placeholder="Explain in simple words why this answer is correct..."></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Simple Tip (Memory helper)</label>
                <input type="text" value={newQuestion.simpleTip} onChange={(e) => setNewQuestion({...newQuestion, simpleTip: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="E.g., Remember: i before e except after c" />
              </div>
              
              <button type="submit" disabled={loading} className="bg-green-600 text-white p-3 rounded-lg w-full hover:bg-green-700">
                {loading ? 'Adding...' : '➕ Add Question'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'batch' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">📦 Batch Upload Questions</h2>
            <div className="mb-4 p-4 bg-yellow-50 rounded">
              <h3 className="font-bold mb-2">📝 Template Format:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`[
  {
    "question": "What is the capital of Zambia?",
    "options": ["Lusaka", "Ndola", "Kitwe", "Livingstone"],
    "correct": 0,
    "subject": "Social Studies",
    "explanation": "Lusaka is the capital city of Zambia!",
    "simpleTip": "Lusaka starts with L like capital!"
  }
]`}
              </pre>
            </div>
            
            <form onSubmit={handleBatchUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Paste your JSON questions here:</label>
                <textarea value={batchQuestions} onChange={(e) => setBatchQuestions(e.target.value)} required rows="10" className="w-full p-3 border rounded-lg font-mono text-sm" placeholder='Paste your JSON array here...'></textarea>
              </div>
              <button type="submit" disabled={loading} className="bg-purple-600 text-white p-3 rounded-lg w-full hover:bg-purple-700">
                {loading ? 'Uploading...' : '📦 Upload Batch'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">📊 Student Progress ({progress.length} answers)</h2>
              <button onClick={() => window.location.reload()} className="bg-blue-500 text-white px-4 py-2 rounded">Refresh</button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {progress.map((p, index) => (
                <div key={p._id} className={`border-l-4 p-4 rounded-lg ${p.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{new Date(p.timestamp).toLocaleString()}</span>
                    <span className={`font-semibold ${p.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {p.isCorrect ? '✓ CORRECT' : '✗ WRONG'}
                    </span>
                  </div>
                  <p className="font-semibold mt-2">{p.question}</p>
                  <div className="text-sm mt-2">
                    <div>Student answered: <span className="font-semibold">{String.fromCharCode(65 + p.studentAnswer)}. {p.question?.options?.[p.studentAnswer] || 'N/A'}</span></div>
                    <div>Correct answer: <span className="font-semibold text-green-600">{String.fromCharCode(65 + p.correctAnswer)}. {p.question?.options?.[p.correctAnswer] || 'N/A'}</span></div>
                    <div>Time spent: <span className="font-semibold">{formatTime(p.timeSpent)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;