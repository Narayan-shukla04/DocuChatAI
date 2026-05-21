import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 glass-card border-b-0 border-dark-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold neon-text">DocuChat AI</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-text-main hover:text-primary transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
