const AmplitudeSingleton = require('../classes/AmplitudeSingleton');

module.exports = {
  logEvent({
    eventType,
    userId,
    eventProperties,
  }) {
    return AmplitudeSingleton.logEvent({
      event_type: eventType,
      user_id: String(userId),
      event_properties: eventProperties,
    })
      .then((response) => console.log(response, userId));
  },
};
