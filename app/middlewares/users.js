module.exports = {

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
