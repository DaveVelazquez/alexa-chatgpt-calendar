import React, { useState, useEffect } from 'react';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/rewards');
      const data = await response.json();
      
      setRewards(data.rewards || []);
      setTotalPoints(data.totalPoints || 0);
      calculateAchievements(data.rewards || [], data.totalPoints || 0);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (rewardsData, points) => {
    const completedTasks = rewardsData.length;
    const newAchievements = [];

    // Achievement definitions
    const achievementsList = [
      {
        id: 'first_task',
        title: '🏆 Primera Victoria',
        description: 'Completa tu primera tarea',
        condition: () => completedTasks >= 1,
        points: 50,
        icon: '🎯'
      },
      {
        id: 'task_master',
        title: '📚 Maestro de Tareas',
        description: 'Completa 10 tareas',
        condition: () => completedTasks >= 10,
        points: 100,
        icon: '👨‍🎓'
      },
      {
        id: 'productive_week',
        title: '📅 Semana Productiva',
        description: 'Completa 7 tareas en una semana',
        condition: () => {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          const weekTasks = rewardsData.filter(reward => 
            new Date(reward.earnedAt) >= lastWeek
          );
          return weekTasks.length >= 7;
        },
        points: 150,
        icon: '🔥'
      },
      {
        id: 'point_collector',
        title: '💰 Coleccionista de Puntos',
        description: 'Acumula 500 puntos',
        condition: () => points >= 500,
        points: 200,
        icon: '💎'
      },
      {
        id: 'consistency_king',
        title: '👑 Rey de la Consistencia',
        description: 'Completa tareas 5 días seguidos',
        condition: () => {
          const dates = rewardsData.map(r => new Date(r.earnedAt).toDateString());
          const uniqueDates = [...new Set(dates)].sort();
          
          let consecutive = 0;
          let maxConsecutive = 0;
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
              consecutive++;
              maxConsecutive = Math.max(maxConsecutive, consecutive + 1);
            } else {
              consecutive = 0;
            }
          }
          
          return maxConsecutive >= 5;
        },
        points: 300,
        icon: '🏅'
      },
      {
        id: 'early_bird',
        title: '🌅 Madrugador',
        description: 'Completa una tarea antes de las 8 AM',
        condition: () => {
          return rewardsData.some(reward => {
            const hour = new Date(reward.earnedAt).getHours();
            return hour < 8;
          });
        },
        points: 75,
        icon: '🐦'
      },
      {
        id: 'night_owl',
        title: '🌙 Búho Nocturno',
        description: 'Completa una tarea después de las 10 PM',
        condition: () => {
          return rewardsData.some(reward => {
            const hour = new Date(reward.earnedAt).getHours();
            return hour >= 22;
          });
        },
        points: 75,
        icon: '🦉'
      },
      {
        id: 'task_variety',
        title: '🎨 Variedad de Tareas',
        description: 'Completa tareas de 3 categorías diferentes',
        condition: () => {
          const categories = new Set(
            rewardsData.map(r => r.taskId?.category).filter(Boolean)
          );
          return categories.size >= 3;
        },
        points: 125,
        icon: '🌈'
      }
    ];

    achievementsList.forEach(achievement => {
      if (achievement.condition()) {
        newAchievements.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        });
      } else {
        newAchievements.push({
          ...achievement,
          unlocked: false
        });
      }
    });

    setAchievements(newAchievements);
  };

  const getPointsLevel = (points) => {
    if (points >= 1000) return { level: 'Leyenda', color: '#ff6b35', icon: '👑' };
    if (points >= 500) return { level: 'Experto', color: '#f7931e', icon: '🏆' };
    if (points >= 250) return { level: 'Avanzado', color: '#2196f3', icon: '⭐' };
    if (points >= 100) return { level: 'Intermedio', color: '#4caf50', icon: '🎯' };
    return { level: 'Principiante', color: '#9e9e9e', icon: '🌱' };
  };

  const level = getPointsLevel(totalPoints);
  const nextLevel = getPointsLevel(totalPoints + 1);
  const nextLevelThreshold = 
    totalPoints >= 1000 ? 1000 :
    totalPoints >= 500 ? 1000 :
    totalPoints >= 250 ? 500 :
    totalPoints >= 100 ? 250 : 100;

  const progressPercent = Math.min((totalPoints / nextLevelThreshold) * 100, 100);

  if (loading) {
    return <div className="loading">Cargando recompensas...</div>;
  }

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <h1>🎁 Sistema de Recompensas</h1>
        <p>Gana puntos completando tareas y desbloquea logros especiales</p>
      </div>

      <div className="level-card">
        <div className="level-info">
          <div className="level-icon">{level.icon}</div>
          <div className="level-details">
            <h2>Nivel Actual: {level.level}</h2>
            <p>{totalPoints} puntos totales</p>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: level.color 
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {totalPoints >= 1000 ? 'Nivel Máximo Alcanzado' : 
                 `${totalPoints}/${nextLevelThreshold} puntos para ${nextLevel.level}`}
              </span>
            </div>
          </div>
        </div>
        <div className="level-badge" style={{ backgroundColor: level.color }}>
          {level.level}
        </div>
      </div>

      <div className="content-grid">
        <div className="achievements-section">
          <h2>🏆 Logros</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="achievement-info">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-points">
                    +{achievement.points} puntos
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="unlocked-date">
                      Desbloqueado: {achievement.unlockedAt.toLocaleDateString('es-ES')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rewards-section">
          <h2>📈 Historial de Recompensas</h2>
          
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <div>
                <div className="stat-number">{rewards.length}</div>
                <div className="stat-label">Tareas Completadas</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div>
                <div className="stat-number">{totalPoints}</div>
                <div className="stat-label">Puntos Totales</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <div>
                <div className="stat-number">{achievements.filter(a => a.unlocked).length}</div>
                <div className="stat-label">Logros Desbloqueados</div>
              </div>
            </div>
          </div>

          <div className="rewards-list">
            {rewards.length === 0 ? (
              <div className="empty-rewards">
                <p>🎯 ¡Completa tu primera tarea para ganar puntos!</p>
                <button 
                  className="create-task-btn"
                  onClick={() => window.location.href = '/tasks'}
                >
                  ➕ Crear Tarea
                </button>
              </div>
            ) : (
              rewards.slice(-10).reverse().map((reward) => (
                <div key={reward._id} className="reward-item">
                  <div className="reward-icon">🎁</div>
                  <div className="reward-info">
                    <h4>Tarea Completada</h4>
                    <p>{reward.taskId?.title || 'Tarea eliminada'}</p>
                    <div className="reward-meta">
                      <span className="reward-points">+{reward.points} puntos</span>
                      <span className="reward-date">
                        {new Date(reward.earnedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {rewards.length > 10 && (
            <div className="show-more">
              <p>Mostrando las últimas 10 recompensas de {rewards.length} totales</p>
            </div>
          )}
        </div>
      </div>

      <div className="motivational-section">
        <div className="motivation-card">
          <h3>💡 ¿Sabías qué?</h3>
          <p>
            Los sistemas de recompensas ayudan a mantener la motivación y crear hábitos positivos. 
            ¡Cada tarea completada te acerca más a tus objetivos!
          </p>
        </div>
        <div className="motivation-card">
          <h3>🎯 Próximo Objetivo</h3>
          <p>
            {totalPoints >= 1000 ? 
              '¡Felicitaciones! Has alcanzado el nivel máximo. Sigue completando tareas para mantener tu racha.' :
              `Solo necesitas ${nextLevelThreshold - totalPoints} puntos más para alcanzar el nivel ${nextLevel.level}.`
            }
          </p>
        </div>
      </div>

      <style jsx>{`
        .rewards-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .rewards-header {
          text-align: center;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .rewards-header h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 2.5rem;
        }

        .rewards-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .level-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .level-info {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }

        .level-icon {
          font-size: 3rem;
          background: rgba(255, 255, 255, 0.2);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .level-details h2 {
          margin: 0 0 5px 0;
          font-size: 1.8rem;
        }

        .level-details p {
          margin: 0 0 15px 0;
          opacity: 0.9;
        }

        .progress-container {
          width: 100%;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .level-badge {
          padding: 15px 25px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .achievements-section,
        .rewards-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .achievements-section h2,
        .rewards-section h2 {
          margin: 0 0 20px 0;
          color: #333;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          padding: 16px;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .achievement-card.unlocked {
          border-color: #28a745;
          background: #f8fff9;
          transform: scale(1.02);
        }

        .achievement-card.locked {
          opacity: 0.6;
          background: #f8f9fa;
        }

        .achievement-icon {
          font-size: 2rem;
          width: 50px;
          text-align: center;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-info h3 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          color: #333;
        }

        .achievement-info p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.4;
        }

        .achievement-points {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          display: inline-block;
        }

        .unlocked-date {
          font-size: 0.75rem;
          color: #28a745;
          margin-top: 4px;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-item {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .rewards-list {
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-rewards {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-rewards p {
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        .create-task-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .create-task-btn:hover {
          background: #218838;
        }

        .reward-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #28a745;
        }

        .reward-icon {
          font-size: 1.5rem;
        }

        .reward-info {
          flex: 1;
        }

        .reward-info h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          color: #333;
        }

        .reward-info p {
          margin: 0 0 6px 0;
          font-size: 0.9rem;
          color: #666;
        }

        .reward-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 0.8rem;
        }

        .reward-points {
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }

        .reward-date {
          color: #999;
        }

        .show-more {
          text-align: center;
          padding: 16px;
          color: #666;
          font-size: 0.9rem;
          border-top: 1px solid #e9ecef;
          margin-top: 16px;
        }

        .motivational-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .motivation-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
        }

        .motivation-card h3 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .motivation-card p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .level-card {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .stats-summary {
            grid-template-columns: 1fr;
          }

          .motivational-section {
            grid-template-columns: 1fr;
          }

          .achievement-card {
            flex-direction: column;
            text-align: center;
          }

          .reward-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Rewards;