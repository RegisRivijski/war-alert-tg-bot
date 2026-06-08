const telegramHelper = require('./telegram');
const usersHelper = require('./usersHelper');
const warAlertHelper = require('./warAlert');

module.exports = {
  async notifySubscribedUsers(bot, changes, hasPreviousState) {
    if (!hasPreviousState) {
      return;
    }

    const affectedStates = [
      ...new Set([
        ...changes.enabled.map((item) => item.state),
        ...changes.disabled.map((item) => item.state),
      ]),
    ];

    if (!affectedStates.length) {
      return;
    }

    const users = await usersHelper.findActiveByRegions(affectedStates);

    for (const user of users) {
      const subscribedRegions = new Set(user.regions);
      const enabled = changes.enabled.filter((item) => subscribedRegions.has(item.state));
      const disabled = changes.disabled.filter((item) => subscribedRegions.has(item.state));

      if (!enabled.length && !disabled.length) {
        continue;
      }

      let reply = '';
      if (enabled.length) {
        reply += warAlertHelper.buildAlertRegionsReply(enabled);
      }
      if (disabled.length) {
        if (reply.length) {
          reply += '\n';
        }
        reply += warAlertHelper.buildSafeRegionsReply(disabled);
      }

      await telegramHelper.sendDirectMessageInChunks(bot, user.chatId, reply)
        .catch(async (error) => {
          const errorCode = error?.response?.error_code;
          if (errorCode === 403 || errorCode === 400) {
            await usersHelper.deactivateUser(user.chatId);
          }
          console.error(`notificationHelper notifySubscribedUsers chatId=${user.chatId}:`, error.message);
        });
    }
  },
};
