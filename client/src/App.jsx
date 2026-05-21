import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-main font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:docId" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
