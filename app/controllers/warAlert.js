const warAlertHelper = require('../helpers/warAlert');

module.exports = {

  async warAlertCheckAll(ctx, next) {
    let alerts = await warAlertHelper.getActiveAlertsUkrzen()
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll warAlertHelper getActiveAlertsUkrzen error:', e.message);
      });

    if (!alerts) {
      alerts = await warAlertHelper.getActiveAlertsVC()
        .catch((e) => {
          console.error('warAlertController warAlertCheckAll warAlertHelper getActiveAlertsVC error:', e.message);
          throw e;
        });
    }

    let reply;
    if (alerts.length) {
      reply = 'Повітряна тривога:\n';
      for (const alert of alerts) {
        reply += `‼️ ${alert}.\n`;
      }
    } else {
      reply = 'Повітряна тривога відсутня у всіх областях України.';
    }

    await ctx.reply(reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll ctx reply error:', e.message);
      });

    await next();
  },
};
