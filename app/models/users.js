const mongoose = require('mongoose');

const connection = require('../classes/MongooseSingleton');

const usersSchema = new mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  regions: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

usersSchema.index({ regions: 1, isActive: 1 });

module.exports = connection.model('users', usersSchema);
