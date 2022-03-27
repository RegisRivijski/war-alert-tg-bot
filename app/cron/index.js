const cronController = require('../controllers/cron');

module.exports = {
  register(bot) {
    cronController.warAlertNotification(bot);
  },
};
