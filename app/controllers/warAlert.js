const analyticEventTypes = require('../constants/analyticEventTypes');

const warAlertHelper = require('../helpers/warAlert');
const telegramHelper = require('../helpers/telegram');

const analyticsManager = require('../managers/analyticsManager');

module.exports = {

  async warAlertCheckAll(ctx, next) {
    const alerts = await warAlertHelper.getActiveAlertsVC()
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll warAlertHelper getActiveAlertsVC error:', e.message);
        throw e;
      });

    let reply = warAlertHelper.buildAlertRegionsReply(alerts);
    reply += '\n🔔 *Підпишіться на сповіщення* — /waralertsubscribe';

    await telegramHelper.sendUserMessageInChunks(ctx, reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll ctx reply error:', e.message);
      });

    analyticsManager.logEvent({
      eventType: analyticEventTypes.CHECK_ACTIVE,
      userId: ctx.update?.message?.from?.id,
    })
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll analyticsManager logEvent:', e.message);
      });

    await next();
  },

  async warAlertCheckSafe(ctx, next) {
    const allRegions = await warAlertHelper.getInactiveAlertsVC()
      .catch((e) => {
        console.error('warAlertController warAlertCheckSafe warAlertHelper getAllRegionsStatus error:', e.message);
        throw e;
      });

    let reply = warAlertHelper.buildSafeRegionsReply(allRegions);
    reply += '\n🔔 *Підпишіться на сповіщення* — /waralertsubscribe';

    await telegramHelper.sendUserMessageInChunks(ctx, reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckSafe ctx reply error:', e.message);
      });

    analyticsManager.logEvent({
      eventType: analyticEventTypes.CHECK_DISABLED,
      userId: ctx.update?.message?.from?.id,
    })
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll analyticsManager logEvent:', e.message);
      });

    await next();
  },
};
