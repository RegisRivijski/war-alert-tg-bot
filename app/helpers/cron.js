const delayHelper = require('./delay');

module.exports = {
  async sendMessageWithBlockCheck(bot, userItem, text) {
    const user = userItem;
    const userIsBlocked = user.isBlocked;

    await bot.telegram.sendChatAction(user.chatId, 'typing')
      .then(() => {
        user.isBlocked = false;
      })
      .catch(() => {
        user.isBlocked = true;
      });

    if (!user.isBlocked) {
      await delayHelper.delay(200);
      await bot.telegram.sendMessage(user.chatId, text)
        .catch((e) => {
          console.error('cron sendMessageWithBlockCheck bot sendMessage:', e.message);
          throw e;
        });
    }

    if (userIsBlocked !== user.isBlocked) {
      await user.save()
        .catch((e) => {
          console.error('cron sendMessageWithBlockCheck user save', e.message);
          throw e;
        });
    }
  },
};
