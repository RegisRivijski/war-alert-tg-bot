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

    const notifications = users.reduce((result, user) => {
      const subscribedRegions = new Set(user.regions);
      const enabled = changes.enabled.filter((item) => subscribedRegions.has(item.state));
      const disabled = changes.disabled.filter((item) => subscribedRegions.has(item.state));

      if (!enabled.length && !disabled.length) {
        return result;
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

      result.push({ chatId: user.chatId, reply });
      return result;
    }, []);

    await Promise.all(notifications.map(({ chatId, reply }) => telegramHelper
      .sendDirectMessageInChunks(bot, chatId, reply)
      .catch(async (error) => {
        const errorCode = error?.response?.error_code;
        if (errorCode === 403 || errorCode === 400) {
          await usersHelper.deactivateUser(chatId);
        }
        console.error(`notificationHelper notifySubscribedUsers chatId=${chatId}:`, error.message);
      })));
  },
};
