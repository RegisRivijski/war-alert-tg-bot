module.exports = {

  getUserName(ctx) {
    return ctx.update.message.from?.username
      ? `@${ctx.update.message.from?.username}`
      : ctx.update.message.from?.first_name;
  },
};
