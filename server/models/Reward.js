const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: 'Task completion reward'
  }
});

module.exports = mongoose.model('Reward', rewardSchema);