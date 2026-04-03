import React from 'react';
import { BookOpen, Settings } from 'lucide-react';

const Header = ({ onAdminClick }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Study Quest</h1>
          </div>
          
          <button
            onClick={onAdminClick}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            <Settings className="w-5 h-5" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;