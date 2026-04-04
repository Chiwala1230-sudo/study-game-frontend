import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedStudent = localStorage.getItem('student');
    if (savedToken && savedStudent) {
      setToken(savedToken);
      setStudent(JSON.parse(savedStudent));
      setCurrentPage('game');
    }
  }, []);

  const handleLogin = (token, studentData) => {
    setToken(token);
    setStudent(studentData);
    localStorage.setItem('token', token);
    localStorage.setItem('student', JSON.stringify(studentData));
    setCurrentPage('game');
  };

  const handleLogout = () => {
    setToken(null);
    setStudent(null);
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} onAdminClick={() => setCurrentPage('admin')} />}
      {currentPage === 'game' && <GamePage student={student} token={token} onLogout={handleLogout} />}
      {currentPage === 'admin' && <AdminPage onBack={() => setCurrentPage('login')} />}
    </div>
  );
}

export default App;