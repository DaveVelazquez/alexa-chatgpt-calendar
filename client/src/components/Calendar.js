import React, { useState, useEffect } from 'react';
import moment from 'moment';

const Calendar = ({ onPointsUpdate }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    rewardPoints: 10
  });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const month = currentDate.month() + 1;
      const year = currentDate.year();
      
      const response = await fetch(`/api/calendar/calendar?month=${month}&year=${year}`);
      const data = await response.json();
      
      setCalendarData(data.calendar || {});
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');
    
    const days = [];
    let current = startDate.clone();
    
    while (current.isSameOrBefore(endDate)) {
      days.push(current.clone());
      current.add(1, 'day');
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    setSelectedDate(date);
    setSelectedTasks(calendarData[dateKey] || []);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !newTask.title.trim()) {
      alert('Por favor selecciona una fecha y escribe un título para la tarea');
      return;
    }
    
    try {
      const taskData = {
        ...newTask,
        date: selectedDate.format('YYYY-MM-DD')
      };
      
      const response = await fetch('/api/calendar/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        setNewTask({ title: '', description: '', priority: 'medium', rewardPoints: 10 });
        setShowTaskForm(false);
        fetchCalendarData();
        if (onPointsUpdate) onPointsUpdate();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea');
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/calendar/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchCalendarData();
        if (selectedDate) {
          handleDateClick(selectedDate);
        }
        if (onPointsUpdate) onPointsUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTasksForDate = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    return calendarData[dateKey] || [];
  };

  const getDateClassName = (date) => {
    let className = 'calendar-day';
    
    if (!date.isSame(currentDate, 'month')) {
      className += ' other-month';
    }
    
    if (date.isSame(moment(), 'day')) {
      className += ' today';
    }
    
    if (selectedDate && date.isSame(selectedDate, 'day')) {
      className += ' selected';
    }
    
    const tasks = getTasksForDate(date);
    if (tasks.length > 0) {
      className += ' has-tasks';
    }
    
    return className;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'pending': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (loading) {
    return <div className="loading">Cargando calendario...</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}
        >
          ← Anterior
        </button>
        <h2>{currentDate.format('MMMM YYYY')}</h2>
        <button 
          className="nav-btn"
          onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}
        >
          Siguiente →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((date) => {
            const tasks = getTasksForDate(date);
            return (
              <div
                key={date.format('YYYY-MM-DD')}
                className={getDateClassName(date)}
                onClick={() => handleDateClick(date)}
              >
                <span className="day-number">{date.format('D')}</span>
                {tasks.length > 0 && (
                  <div className="task-indicators">
                    {tasks.slice(0, 3).map((task, index) => (
                      <div
                        key={task._id}
                        className="task-indicator"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                        title={task.title}
                      />
                    ))}
                    {tasks.length > 3 && (
                      <span className="more-tasks">+{tasks.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="task-details">
          <div className="task-details-header">
            <h3>📅 {selectedDate.format('dddd, D [de] MMMM [de] YYYY')}</h3>
            <button
              className="add-task-btn"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              ➕ Nueva Tarea
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleTaskSubmit} className="task-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Título de la tarea"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Descripción (opcional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Puntos de recompensa"
                    min="1"
                    max="100"
                    value={newTask.rewardPoints}
                    onChange={(e) => setNewTask({ ...newTask, rewardPoints: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Crear Tarea</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="tasks-for-date">
            {selectedTasks.length === 0 ? (
              <p className="no-tasks">No hay tareas programadas para este día</p>
            ) : (
              selectedTasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusUpdate(task._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in-progress">En Progreso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span className="points-badge">⭐ {task.rewardPoints} puntos</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #667eea;
        }

        .calendar-header h2 {
          margin: 0;
          color: #333;
          text-transform: capitalize;
        }

        .nav-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .nav-btn:hover {
          background: #5a67d8;
        }

        .calendar-grid {
          margin-bottom: 24px;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 8px;
        }

        .weekday {
          text-align: center;
          font-weight: bold;
          color: #666;
          padding: 8px;
          background: #f8f9fa;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e9ecef;
        }

        .calendar-day {
          background: white;
          min-height: 80px;
          padding: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .calendar-day:hover {
          background: #f8f9ff;
        }

        .calendar-day.other-month {
          background: #f8f9fa;
          color: #ccc;
        }

        .calendar-day.today {
          background: #e3f2fd;
          font-weight: bold;
        }

        .calendar-day.selected {
          background: #667eea;
          color: white;
        }

        .calendar-day.has-tasks {
          border-left: 4px solid #667eea;
        }

        .day-number {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .task-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          align-items: center;
        }

        .task-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .more-tasks {
          font-size: 0.7rem;
          color: #666;
        }

        .task-details {
          border-top: 2px solid #e9ecef;
          padding-top: 24px;
        }

        .task-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .task-details-header h3 {
          margin: 0;
          color: #333;
        }

        .add-task-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .add-task-btn:hover {
          background: #218838;
        }

        .task-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .submit-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .tasks-for-date {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-tasks {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        .task-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          transition: box-shadow 0.2s ease;
        }

        .task-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .task-header h4 {
          margin: 0;
          color: #333;
        }

        .status-select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }

        .task-description {
          color: #666;
          margin: 8px 0;
          font-size: 14px;
        }

        .task-meta {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .priority-badge,
        .points-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .priority-badge {
          color: white;
          text-transform: capitalize;
        }

        .points-badge {
          background: #fff3cd;
          color: #856404;
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .calendar-day {
            min-height: 60px;
            padding: 4px;
          }
          
          .task-details-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;