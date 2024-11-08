const cron = require('node-cron');
const NodeCache = require('node-cache');

const {
  CHANNEL_ID,
} = require('../constants/index');

const { formatTime } = require('../helpers/timeHelper');
const warAlertManager = require('../managers/warAlert');

const statesCache = new NodeCache();

module.exports = {
  warAlertNotification(bot) {
    cron.schedule('* * * * *', async () => {
      const statesOld = statesCache.get('states');
      const alertsDisabledOld = statesCache.get('alertsDisabled');

      const statesNew = await warAlertManager.getActiveAlertsVC()
        .then((data) => data.states)
        .catch((e) => {
          console.error('cronController warAlertNotification warAlertManager getActiveAlertsVC error:', e.message);
          return {};
        });

      const states = Object.keys(statesNew);
      const result = {
        enabled: [],
        disabled: [],
      };

      let alertsDisabled = true;
      if (statesOld) {
        for (const state of states) {
          const stateDataNew = statesNew[state];
          const stateDataOld = statesOld[state] || {};

          if (stateDataNew.enabled) {
            alertsDisabled = false;
          }

          if (stateDataNew.enabled && !stateDataOld.enabled) {
            result.enabled.push({
              state,
              district: '',
              time: formatTime(stateDataNew.enabled_at),
            });
          } else if (!stateDataNew.enabled && stateDataOld.enabled) {
            result.disabled.push({
              state,
              district: '',
              time: formatTime(stateDataNew.disabled_at),
            });
          }

          // eslint-disable-next-line guard-for-in
          for (const district in stateDataNew.districts) {
            const districtDataNew = stateDataNew.districts[district];
            const districtDataOld = (stateDataOld.districts || {})[district] || {};

            if (districtDataNew.enabled) {
              alertsDisabled = false;
            }

            if (districtDataNew.enabled && !districtDataOld.enabled) {
              result.enabled.push({
                state,
                district,
                time: formatTime(districtDataNew.enabled_at),
              });
            } else if (!districtDataNew.enabled && districtDataOld.enabled) {
              result.disabled.push({
                state,
                district,
                time: formatTime(districtDataNew.disabled_at),
              });
            }
          }
        }
      } else {
        for (const state of states) {
          const stateDataNew = statesNew[state];

          if (stateDataNew.enabled) {
            alertsDisabled = false;
            result.enabled.push({
              state,
              district: '',
              time: formatTime(stateDataNew.enabled_at),
            });
          }

          // eslint-disable-next-line guard-for-in
          for (const district in stateDataNew.districts) {
            const districtDataNew = stateDataNew.districts[district];

            if (districtDataNew.enabled) {
              alertsDisabled = false;
              result.enabled.push({
                state,
                district,
                time: formatTime(districtDataNew.enabled_at),
              });
            }
          }
        }
      }

      let reply = '';
      if (result.enabled.length) {
        reply += '🚨 *Повітряна тривога оголошена!* 🚨\n\n';
        reply += '🔴 _Тривога в наступних регіонах:_\n';
        for (const alert of result.enabled) {
          reply += `🔸 *${alert.state}*`;
          if (alert.district) {
            reply += `, ${alert.district}`;
          }
          reply += ` _(оголошено: ${alert.time})_\n`;
        }
        reply += '\n⚠️ _Рекомендуємо негайно перейти в укриття!_\n';
      }
      if (result.disabled.length) {
        if (reply.length) reply += '\n';
        reply += '🟢 *Відбій повітряної тривоги!* 🟢\n\n';
        reply += '✅ _Тривога скасована в наступних регіонах:_\n';
        for (const alert of result.disabled) {
          reply += `🔹 *${alert.state}*`;
          if (alert.district) {
            reply += `, ${alert.district}`;
          }
          reply += ` _(відбій: ${alert.time})_\n`;
        }
        reply += '\n👤 _Можете покинути укриття, але залишайтесь обережними._\n';
      }

      if (states.length) {
        if (!alertsDisabledOld && alertsDisabled) {
          reply = '🟩 *На даний момент повітряна тривога відсутня по всій території України.* Спокійного дня! 🕊️\n';
        }
        statesCache.set('states', statesNew);
        statesCache.set('alertsDisabled', alertsDisabled);
      }

      if (reply) {
        await bot.telegram.sendMessage(CHANNEL_ID, reply, { parse_mode: 'Markdown' })
          .catch((e) => {
            console.error('cron warAlertNotification bot sendMessage:', e.message);
          });
      }
    });
  },
};
