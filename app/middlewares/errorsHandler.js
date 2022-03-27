const {
  OWNER_CHAT_ID,
} = require('../constants/index');

module.exports = {
  async onError(ctx, next) {
    try {
      await next();
    } catch (e) {
      await ctx.reply('Упс! Щось пішло не так.')
        .catch((error) => {
          console.error('error in errorsHandler onError catch reply:', error.message);
        });
      await ctx.telegram.sendMessage(OWNER_CHAT_ID, `${ctx.update.message.text}, ${ctx.update.message.from.id}:\n${e.message}\n${e.stack}`)
        .catch((error) => {
          console.error('error in errorsHandler onError catch sendMessage:', error.message);
        });
      console.error(e.message);
    }
  },
};
