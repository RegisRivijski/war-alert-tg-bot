const mongoose = require('mongoose');

module.exports = mongoose.model('users', new mongoose.Schema({
  chatId: {
    type: Number,
    default: 0,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}));
