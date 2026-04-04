import React, { useState } from 'react';
import api from '../services/api';

function LoginPage({ onLogin, onAdminClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        const response = await api.post('/register', { username, password, name, grade });
        onLogin(response.data.token, response.data.user);
      } else {
        const response = await api.post('/login', { username, password });
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.emoji}>📚✨</span>
          <h1 style={styles.title}>Perez Study Game</h1>
          <p style={styles.subtitle}>Grade 7 Learning Adventure</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={styles.input}
                required
              >
                <option value="">Select Grade</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
              </select>
            </>
          )}
          
          {error && <p style={styles.error}>{error}</p>}
          
          <button type="submit" style={styles.loginButton}>
            {isRegistering ? 'Register' : 'Start Playing'} 🎮
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={styles.switchButton}
          >
            {isRegistering ? 'Already have an account? Login' : 'New student? Register here'}
          </button>
          
          <button
            type="button"
            onClick={onAdminClick}
            style={styles.adminButton}
          >
            👑 Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  emoji: {
    fontSize: '50px'
  },
  title: {
    color: '#764ba2',
    fontSize: '28px',
    margin: '10px 0 5px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none'
  },
  loginButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '14px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#764ba2',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  adminButton: {
    background: '#f0f0f0',
    color: '#666',
    padding: '10px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    color: 'red',
    fontSize: '14px',
    textAlign: 'center'
  }
};

export default LoginPage;