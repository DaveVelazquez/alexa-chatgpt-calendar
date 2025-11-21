import React, { useState, useEffect } from 'react';

const Dashboard = ({ onPointsUpdate }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalPoints: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasksResponse = await fetch('/api/calendar/tasks');
      const tasks = await tasksResponse.json();
      
      // Fetch rewards
      const rewardsResponse = await fetch('/api/calendar/rewards');
      const rewards = await rewardsResponse.json();
      
      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      
      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        totalPoints: rewards.totalPoints || 0
      });
      
      // Recent tasks (last 5)
      setRecentTasks(tasks.slice(-5).reverse());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'pending': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '⏳';
      case 'pending': return '📋';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Tareas</h3>
            <div className="stat-number">{stats.totalTasks}</div>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completadas</h3>
            <div className="stat-number">{stats.completedTasks}</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Pendientes</h3>
            <div className="stat-number">{stats.pendingTasks}</div>
          </div>
        </div>
        
        <div className="stat-card points">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>Puntos Totales</h3>
            <div className="stat-number">{stats.totalPoints}</div>
          </div>
        </div>
      </div>

      <div className="recent-tasks-section">
        <h2>📝 Tareas Recientes</h2>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas recientes. ¡Crea tu primera tarea!</p>
          </div>
        ) : (
          <div className="tasks-list">
            {recentTasks.map((task) => (
              <div key={task._id} className="task-item">
                <div className="task-status">
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  ></span>
                  {getStatusEmoji(task.status)}
                </div>
                <div className="task-content">
                  <h4>{task.title}</h4>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span className="task-date">
                      📅 {new Date(task.date).toLocaleDateString('es-ES')}
                    </span>
                    <span 
                      className="task-priority"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      🔥 {task.priority}
                    </span>
                    <span className="task-points">
                      ⭐ {task.rewardPoints} puntos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>🚀 Acciones Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => window.location.href = '/tasks'}
          >
            ➕ Nueva Tarea
          </button>
          <button 
            className="action-btn"
            onClick={() => window.location.href = '/calendar'}
          >
            📅 Ver Calendario
          </button>
          <button 
            className="action-btn"
            onClick={() => window.location.href = '/chatgpt'}
          >
            🤖 Consultar ChatGPT
          </button>
          <button 
            className="action-btn"
            onClick={fetchDashboardData}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: grid;
          gap: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .stat-card.completed {
          border-left: 5px solid #4caf50;
        }

        .stat-card.pending {
          border-left: 5px solid #2196f3;
        }

        .stat-card.points {
          border-left: 5px solid #ff9800;
        }

        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .stat-info h3 {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
        }

        .recent-tasks-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .recent-tasks-section h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .task-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .task-content {
          flex: 1;
        }

        .task-content h4 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .task-content p {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .task-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: #666;
        }

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .quick-actions h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(102, 126, 234, 0.4);
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
          
          .task-meta {
            flex-direction: column;
            gap: 8px;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;