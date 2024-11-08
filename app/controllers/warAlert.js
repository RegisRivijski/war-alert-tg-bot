const { formatTime } = require('../helpers/timeHelper');
const warAlertHelper = require('../helpers/warAlert');
const telegramHelper = require('../helpers/telegram');

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
      reply += '🔴 _На даний момент повітряна тривога оголошена в наступних регіонах:_\n\n';

      for (const alert of alerts) {
        reply += `🔸 *${alert.state}*`;

        if (alert.district) {
          reply += `, ${alert.district}`;
        }

        if (alert.enabled_at) {
          const formattedTime = formatTime(alert.enabled_at);
          reply += ` _(оголошено: ${formattedTime})_`;
        }

        reply += '\n';
      }

      reply += '\n⚠️ Будьте обережні та залишайтеся в безпечному місці!\n';
    } else {
      reply = '🟢 На даний момент повітряна тривога відсутня по всіх областях України. Спокійного дня! 🕊️\n';
    }

    reply += '\n👁‍🗨 *Підписуйтесь на оновлення* — @warAlertTgUkraine';

    await telegramHelper.sendUserMessageInChunks(ctx, reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckAll ctx reply error:', e.message);
      });

    await next();
  },

  async warAlertCheckSafe(ctx, next) {
    const allRegions = await warAlertHelper.getInactiveAlertsVC()
      .catch((e) => {
        console.error('warAlertController warAlertCheckSafe warAlertHelper getAllRegionsStatus error:', e.message);
        throw e;
      });

    let reply = '';
    const safeRegions = allRegions.filter((region) => !region.enabled);

    if (safeRegions.length) {
      reply += '🟢 *Регіони без повітряної тривоги:* 🟢\n\n';
      for (const region of safeRegions) {
        reply += `✅ *${region.state}*`;

        if (region.district) {
          reply += `, ${region.district}`;
        }

        if (region.disabled_at) {
          const formattedTime = formatTime(region.disabled_at);
          reply += ` _(відбій: ${formattedTime})_`;
        }

        reply += '\n';
      }
    } else {
      reply = '🔴 На даний момент повітряна тривога оголошена у всіх регіонах України.\n';
    }

    reply += '\n👁‍🗨 *Підписуйтесь на оновлення* — @warAlertTgUkraine';

    await telegramHelper.sendUserMessageInChunks(ctx, reply)
      .catch((e) => {
        console.error('warAlertController warAlertCheckSafe ctx reply error:', e.message);
      });

    await next();
  },
};
