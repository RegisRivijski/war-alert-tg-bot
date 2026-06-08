const usersHelper = require('../helpers/usersHelper');

module.exports = {

  async ensureUser(ctx, next) {
    await usersHelper.ensureUser(ctx)
      .catch((error) => {
        console.error('usersMiddleware ensureUser error:', error.message);
      });

    await next();
  },

  async canReply(ctx, next) {
    let canReply = true;
    await ctx.replyWithChatAction('typing')
      .catch(() => {
        canReply = false;
      });

    if (canReply) {
      await next();
    }
  },
};
