const UmamiSingleton = require('../classes/UmamiSingleton');

module.exports = {
  logEvent({
    eventType,
    userId,
    eventProperties,
  }) {
    return UmamiSingleton.logEvent({
      event_type: eventType,
      user_id: String(userId),
      event_properties: eventProperties,
    });
  },
};

