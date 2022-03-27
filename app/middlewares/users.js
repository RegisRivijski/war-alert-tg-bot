const usersHelper = require('../helpers/users');

module.exports = {

  async canReply(ctx, next) {
    let canReply = true;
    await ctx.replyWithChatAction('typing')
      .catch(() => {
        canReply = false;
      });

    const user = await usersHelper.getUserInfo(ctx)
      .catch((e) => {
        console.error('standardController start usersHelper checkUserInfo error:', e.message);
      });

    if (canReply) {
      await next();
    } else {
      user.isBlocked = true;
      await user.save()
        .catch((e) => {
          console.error('usersMiddleware canReply user save error:', e.message);
        });
    }
  },
};
