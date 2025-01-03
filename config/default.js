module.exports = {
  application: {
    name: 'war-alert-tg-bot',
    version: '1.0.0',
  },
  telegramBotApi: {
    protocol: process.env.TELEGRAM_BOT_API_PROTOCOL,
    host: process.env.TELEGRAM_BOT_API_HOST,
    port: process.env.TELEGRAM_BOT_API_PORT,
  },
  bot: {
    API_TOKEN: process.env.WAR_ALERT_TG_BOT_API_TOKEN,
    limit: {
      window: 1500,
      limit: 1,
    },
  },
  analytics: {
    Amplitude: {
      key: process.env.AMPLITUDE_WAR_ALERT_TG_API_KEY,
    },
  },
  db: {
    mongodb: {
      url: process.env.MONGODB_WAR_ALERT_TG_BOT_URL,
      api_key: process.env.MONGODB_WAR_ALERT_TG_BOT_API_KEY,
    },
  },
  rest: {
    ukrzen: {
      protocol: process.env.UKRZEN_PROTOCOL,
      host: process.env.URKZEN_HOST,
    },
    vadimklimenko: {
      protocol: process.env.VADIMKLIMENKO_PROTOCOL,
      host: process.env.VADIMKLIMENKO_HOST,
    },
  },
};
