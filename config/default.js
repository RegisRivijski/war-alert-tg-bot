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
    umami: {
      host: process.env.UMAMI_HOST,
      websiteId: process.env.UMAMI_WEBSITE_ID_WAR_ALERT,
      hostname: 'war-alert',
    },
  },
  db: {
    mongodb: {
      url: process.env.MONGODB_1_HOSTNAME,
      options: {
        dbName: 'warAlertTgBot',
        user: process.env.MONGO_INITDB_ROOT_USERNAME,
        pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
        authSource: 'admin',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: false,
      },
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
