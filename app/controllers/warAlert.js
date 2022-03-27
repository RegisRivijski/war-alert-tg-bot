const warAlertHelper = require('../helpers/warAlert');

module.exports = {

  async warAlertCheckAll(ctx, next) {
    const alerts = await warAlertHelper.getActiveAlertsVC()
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll warAlertHelper getActiveAlertsVC error:', e.message);
        throw e;
      });

    let reply = '';
    if (alerts.length) {
      reply += '🛑Увага! Повітряна тривога.🛑\n';
      for (const alert of alerts) {
        reply += `‼️ ${alert.state}`;
        if (alert.district) {
          reply += `, ${alert.district}.\n`;
        } else {
          reply += '.\n';
        }
      }
    } else {
      reply = 'Повітряна тривога відсутня по всіх областях України.';
    }

    await ctx.reply(reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll ctx reply error:', e.message);
      });

    await next();
  },
};
