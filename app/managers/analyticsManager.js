const UmamiSingleton = require('../classes/UmamiSingleton');

function languageFromCtx(ctx) {
  return ctx?.from?.language_code
    || ctx?.update?.callback_query?.from?.language_code
    || ctx?.update?.message?.from?.language_code;
}

module.exports = {
  logEvent({
    eventType,
    userId,
    eventProperties,
    language,
    country,
    ctx,
  }) {
    return UmamiSingleton.logEvent({
      event_type: eventType,
      user_id: String(userId),
      event_properties: eventProperties,
      language: language || languageFromCtx(ctx),
      country,
    });
  },
};


