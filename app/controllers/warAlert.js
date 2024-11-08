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
      reply += '🚨 *УВАГА! Повітряна тривога!* 🚨\n\n';
      reply += '🔴 На даний момент повітряна тривога оголошена в наступних регіонах:\n\n';
      for (const alert of alerts) {
        reply += `🔸 *${alert.state}*`;
        if (alert.district) {
          reply += `, ${alert.district}.\n`;
        } else {
          reply += '.\n';
        }
      }
      reply += '\n⚠️ Будьте обережні та залишайтеся в безпечному місці!\n';
    } else {
      reply = '🟢 На даний момент повітряна тривога відсутня по всіх областях України. Спокійного дня!\n';
    }

    reply += '\n👁‍🗨 *Підписуйтесь на оновлення* — @warAlertTgUkraine';
    await ctx.replyWithMarkdown(reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll ctx reply error:', e.message);
      });

    await next();
  },
};
