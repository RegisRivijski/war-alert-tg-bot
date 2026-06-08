const mongoose = require('mongoose');
const config = require('config');

const connection = mongoose.createConnection(
  config.db.mongodb.url,
  config.db.mongodb.options,
);

connection.on('connected', () => {
  console.info('[Mongoose] warAlertTgBot connected');
});

connection.on('error', (error) => {
  console.error('[Mongoose] warAlertTgBot connection error:', error.message);
});

module.exports = connection;
