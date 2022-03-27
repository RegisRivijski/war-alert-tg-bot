module.exports = {
  application: {
    name: 'war-alert-tg-bot',
    version: '1.0.0',
  },
  bot: {
    API_TOKEN: '5170653707:AAFTBYKI1QBpr43TScDjPGBCH05kltghq70',
    limit: {
      window: 1500,
      limit: 1,
    },
  },
  db: {
    mongodb: {
      url: 'mongodb+srv://general:7js8hPKW6aLzSVP6@cluster0.baeyx.mongodb.net/warAlertTgBot?retryWrites=true&w=majority',
      api_key: '8289a1d4-5258-4b6a-9790-13cde6e3300b',
    },
  },
  rest: {
    ukrzen: {
      protocol: 'https:',
      host: 'war.ukrzen.in.ua',
    },
    vadimklimenko: {
      protocol: 'https:',
      host: 'vadimklimenko.com',
    },
  },
};
