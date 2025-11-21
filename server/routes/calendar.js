const express = require('express');
const Task = require('../models/Task');
const Reward = require('../models/Reward');
const moment = require('moment');

const router = express.Router();

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const { date, status } = req.query;
    let filter = {};
    
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    if (status) {
      filter.status = status;
    }
    
    const tasks = await Task.find(filter).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    console.log('Database error:', error.message);
    res.json([]); // Return empty array instead of error
  }
});

// Create new task
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, date, priority, rewardPoints } = req.body;
    
    const task = new Task({
      title,
      description,
      date: new Date(date),
      priority: priority || 'medium',
      rewardPoints: rewardPoints || 10,
      status: 'pending'
    });
    
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task status
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updates } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      id,
      { ...updates, status },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // If task is completed, add reward points
    if (status === 'completed' && task.status !== 'completed') {
      const reward = new Reward({
        taskId: id,
        points: task.rewardPoints,
        earnedAt: new Date()
      });
      await reward.save();
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rewards/points summary
router.get('/rewards', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        totalPoints: 0,
        rewards: [],
        recentRewards: []
      });
    }

    const rewards = await Reward.find().populate('taskId');
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
    
    res.json({
      totalPoints,
      rewards,
      recentRewards: rewards.slice(-10) // Last 10 rewards
    });
  } catch (error) {
    console.log('Database error:', error.message);
    res.json({
      totalPoints: 0,
      rewards: [],
      recentRewards: []
    });
  }
});

// Get calendar view (tasks grouped by date)
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = moment();
    const targetMonth = month ? parseInt(month) : currentDate.month() + 1;
    const targetYear = year ? parseInt(year) : currentDate.year();
    
    const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
    const endDate = moment(`${targetYear}-${targetMonth}-01`).endOf('month');
    
    const tasks = await Task.find({
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    }).sort({ date: 1 });
    
    // Group tasks by date
    const calendar = {};
    tasks.forEach(task => {
      const dateKey = moment(task.date).format('YYYY-MM-DD');
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(task);
    });
    
    res.json({
      month: targetMonth,
      year: targetYear,
      calendar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;