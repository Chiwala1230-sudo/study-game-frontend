import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg border-b-4 border-pink-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">👩‍🎓🌸</div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Perez's Study Adventure
                  </h1>
                  <p className="text-xs text-pink-500">Grade 7 • Shine Bright! ✨</p>
                </div>
              </div>
              <div className="space-x-3">
                <Link 
                  to="/" 
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                >
                  🎮 Game
                </Link>
                <Link 
                  to="/admin" 
                  className="px-5 py-2 rounded-full bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50 transition-all"
                >
                  🔐 Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;