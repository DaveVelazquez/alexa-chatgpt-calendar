import React, { useState, useEffect } from 'react';

const Tasks = ({ onPointsUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'other',
    rewardPoints: 10
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filter, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = tasks;

    // Apply filter
    if (filter !== 'all') {
      filtered = tasks.filter(task => task.status === filter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'points':
          return b.rewardPoints - a.rewardPoints;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let url = '/api/calendar/tasks';
      let method = 'POST';
      let taskData = { ...newTask };

      if (editingTask) {
        url = `/api/calendar/tasks/${editingTask._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        resetForm();
        fetchTasks();
        if (onPointsUpdate) onPointsUpdate();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar la tarea');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      date: new Date(task.date).toISOString().split('T')[0],
      priority: task.priority,
      category: task.category,
      rewardPoints: task.rewardPoints
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTasks();
        if (onPointsUpdate) onPointsUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/calendar/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
        if (onPointsUpdate) onPointsUpdate();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'other',
      rewardPoints: 10
    });
    setEditingTask(null);
    setShowForm(false);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'health': return '🏥';
      case 'learning': return '📚';
      default: return '📝';
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

  if (loading) {
    return <div className="loading">Cargando tareas...</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>📋 Gestión de Tareas</h1>
        <button 
          className="add-task-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Nueva Tarea
        </button>
      </div>

      <div className="tasks-controls">
        <div className="filters">
          <label>Filtrar por estado:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Progreso</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        <div className="sorting">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Fecha</option>
            <option value="priority">Prioridad</option>
            <option value="points">Puntos</option>
            <option value="title">Título</option>
          </select>
        </div>

        <div className="stats">
          <span className="stat">📊 Total: {tasks.length}</span>
          <span className="stat">⏳ Pendientes: {tasks.filter(t => t.status === 'pending').length}</span>
          <span className="stat">✅ Completadas: {tasks.filter(t => t.status === 'completed').length}</span>
        </div>
      </div>

      {showForm && (
        <div className="task-form-overlay">
          <div className="task-form-modal">
            <div className="form-header">
              <h2>{editingTask ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}</h2>
              <button 
                className="close-btn"
                onClick={resetForm}
              >
                ✖️
              </button>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  placeholder="Escribe el título de la tarea"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descripción opcional de la tarea"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🔵 Media</option>
                    <option value="high">🟠 Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    <option value="work">💼 Trabajo</option>
                    <option value="personal">👤 Personal</option>
                    <option value="health">🏥 Salud</option>
                    <option value="learning">📚 Aprendizaje</option>
                    <option value="other">📝 Otros</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Puntos de Recompensa</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newTask.rewardPoints}
                    onChange={(e) => setNewTask({ ...newTask, rewardPoints: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingTask ? '💾 Actualizar' : '➕ Crear'} Tarea
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>🔍 No se encontraron tareas con los filtros actuales</p>
            <button className="add-task-btn" onClick={() => setShowForm(true)}>
              ➕ Crear primera tarea
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-main">
                <div className="task-header">
                  <div className="task-title-section">
                    <span className="category-icon">{getCategoryEmoji(task.category)}</span>
                    <h3>{task.title}</h3>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(task)}
                      title="Editar tarea"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(task._id)}
                      title="Eliminar tarea"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta">
                  <span className="task-date">
                    📅 {new Date(task.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="task-points">⭐ {task.rewardPoints} puntos</span>
                  <span className="task-created">
                    🕒 Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="task-status">
                <div className="status-display">
                  <span className="status-emoji">{getStatusEmoji(task.status)}</span>
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">📋 Pendiente</option>
                  <option value="in-progress">⏳ En Progreso</option>
                  <option value="completed">✅ Completada</option>
                  <option value="cancelled">❌ Cancelada</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .tasks-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .tasks-header h1 {
          margin: 0;
          color: #333;
        }

        .add-task-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .add-task-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(102, 126, 234, 0.4);
        }

        .tasks-controls {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .filters,
        .sorting {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filters label,
        .sorting label {
          font-weight: 500;
          color: #666;
          white-space: nowrap;
        }

        .filters select,
        .sorting select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .stats {
          display: flex;
          gap: 16px;
          justify-self: end;
        }

        .stat {
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }

        .task-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .task-form-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-btn:hover {
          background: #f0f0f0;
        }

        .task-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .submit-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          flex: 1;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          flex: 1;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .empty-state p {
          color: #666;
          font-size: 18px;
          margin-bottom: 20px;
        }

        .task-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: flex-start;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .task-main {
          flex: 1;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .task-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .category-icon {
          font-size: 20px;
        }

        .task-header h3 {
          margin: 0;
          color: #333;
          flex: 1;
        }

        .priority-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .task-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }

        .edit-btn:hover {
          background: #e3f2fd;
        }

        .delete-btn:hover {
          background: #ffebee;
        }

        .task-description {
          color: #666;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: #666;
        }

        .task-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .status-display {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-select {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .tasks-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .tasks-controls {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stats {
            justify-self: stretch;
            flex-direction: column;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .task-card {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .task-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .task-actions {
            align-self: flex-end;
          }

          .task-meta {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Tasks;