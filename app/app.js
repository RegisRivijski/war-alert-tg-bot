const config = require('config');
const rateLimit = require('telegraf-ratelimit');
const ignoreOldMessages = require('telegraf-ignore-old-messages');
const { Telegraf } = require('telegraf');

const apiRoot = `${config.telegramBotApi.protocol}//${config.telegramBotApi.host}:${config.telegramBotApi.port}`;

const commands = require('./commands/index');
const cron = require('./cron/index');

const bot = new Telegraf(config.bot.API_TOKEN, {
  telegram: {
    apiRoot,
  },
});

bot.use(rateLimit(config.bot.limit));
bot.use(ignoreOldMessages(1));

commands(bot);
cron.register(bot);

bot.startPolling();
