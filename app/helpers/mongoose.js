const config = require('config');
const mongoose = require('mongoose');

module.exports = {
  connect() {
    mongoose.connection.on('open', () => {
      console.info('Successfully connected to database.');
    });

    mongoose.connection.on('error', () => {
      throw new Error('Could not connect to MongoDB.');
    });

    return mongoose.connect(config.db.mongodb.url);
  },
};
