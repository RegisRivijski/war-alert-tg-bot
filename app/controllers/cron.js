const cron = require('node-cron');
const NodeCache = require('node-cache');
const warAlertManager = require('../managers/warAlert');

const {
  CHANNEL_ID,
} = require('../constants/index');

const statesCache = new NodeCache();

module.exports = {
  warAlertNotification(bot) {
    cron.schedule('* * * * *', async () => {
      const statesOld = statesCache.get('states');
      const allAlertsAreDisabledReplied = statesCache.get('allAlertsAreDisabledReplied');
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

      if (statesOld) {
        for (const state of states) {
          if (statesNew[state].enabled && !statesOld[state].enabled) {
            result.enabled.push({
              state,
              district: '',
            });
          } else if (!statesNew[state].enabled && statesOld[state].enabled) {
            result.disabled.push({
              state,
              district: '',
            });
          }
          const districts = Object.keys(statesNew[state].districts);
          for (const district of districts) {
            if (
              statesNew[state].districts[district].enabled
              && !statesOld[state].districts[district].enabled
            ) {
              result.enabled.push({
                state,
                district,
              });
            } else if (
              !statesNew[state].districts[district].enabled
              && statesOld[state].districts[district].enabled
            ) {
              result.disabled.push({
                state,
                district,
              });
            }
          }
        }
      } else {
        for (const state of states) {
          if (statesNew[state].enabled) {
            result.enabled.push({
              state,
              district: '',
            });
          }
          const districts = Object.keys(statesNew[state].districts);
          for (const district of districts) {
            if (statesNew[state].districts[district].enabled) {
              result.enabled.push({
                state,
                district,
              });
            }
          }
        }
      }

      let reply = '';
      if (result.enabled.length) {
        reply += '🛑Увага! Повітряна тривога.🛑\n';
        for (const alert of result.enabled) {
          reply += `‼️ ${alert.state}`;
          if (alert.district) {
            reply += `, ${alert.district}.\n`;
          } else {
            reply += '.\n';
          }
        }
      }
      if (result.disabled.length) {
        if (reply.length) reply += '\n';
        reply += '🟩Відбій повітряної тривоги.🟩\n';
        for (const alert of result.disabled) {
          reply += `‼️ ${alert.state}`;
          if (alert.district) {
            reply += `, ${alert.district}.\n`;
          } else {
            reply += '.\n';
          }
        }
      }
      if (!result.enabled.length && !result.disabled.length && !allAlertsAreDisabledReplied) {
        reply = 'Повітряна тривога відсутня по всіх областях України.\n';
      }

      if (states.length) {
        statesCache.set('states', statesNew, 600000);
        if (!result.enabled.length && !result.disabled.length) {
          statesCache.set('allAlertsAreDisabledReplied', true);
        } else {
          statesCache.set('allAlertsAreDisabledReplied', false);
        }
      }

      if (reply) {
        reply += '\n-  @warAlertTgUkraine  -';
        await bot.telegram.sendMessage(CHANNEL_ID, reply)
          .catch((e) => {
            console.error('cron warAlertNotification bot sendMessage:', e.message);
          });
      }
    });
  },
};
