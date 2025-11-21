import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import ChatGPT from './components/ChatGPT';
import Tasks from './components/Tasks';
import Rewards from './components/Rewards';
import Setup from './components/Setup';
import './App.css';

function App() {
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/calendar/rewards');
      const data = await response.json();
      setTotalPoints(data.totalPoints || 0);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>🗓️ Alexa ChatGPT Calendar</h1>
            <p>Tu asistente inteligente de calendario con recompensas</p>
            <div className="points-display">
              🏆 Puntos totales: {totalPoints}
            </div>
          </div>
        </header>

        <nav className="app-nav">
          <div className="container">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              📅 Calendario
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              ✅ Tareas
            </NavLink>
            <NavLink to="/chatgpt" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🤖 ChatGPT
            </NavLink>
            <NavLink to="/rewards" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🎁 Recompensas
            </NavLink>
            <NavLink to="/setup" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              ⚙️ Configuración
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard onPointsUpdate={fetchRewards} />} />
              <Route path="/calendar" element={<Calendar onPointsUpdate={fetchRewards} />} />
              <Route path="/tasks" element={<Tasks onPointsUpdate={fetchRewards} />} />
              <Route path="/chatgpt" element={<ChatGPT />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/setup" element={<Setup />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>© 2025 Alexa ChatGPT Calendar Skill</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;