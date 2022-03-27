module.exports = {

  async start(ctx, next) {
    const reply = 'Даний бот повідомлятиме про повітряну тривогу у різних областях України.\n'
    + 'Команди:\n'
    + '/waralertcheckall - отримання інформації про повітрянні тривогу по усій Україні.\n';

    await ctx.reply(reply)
      .catch((e) => {
        console.error('standardController start ctx reply:', e.message);
        throw e;
      });

    await next();
  },

  async help(ctx, next) {
    const reply = 'Команди:\n'
      + '/waralertcheckall - отримання інформації про повітрянні тривогу по усій Україні.\n';

    await ctx.reply(reply)
      .catch((e) => {
        console.error('help reply:', e);
        throw e;
      });
    await next();
  },
};
