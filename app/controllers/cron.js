const cron = require('node-cron');
const NodeCache = require('node-cache');
const warAlertManager = require('../managers/warAlert');
const usersManager = require('../managers/users');
const cronHelper = require('../helpers/cron');

const statesCache = new NodeCache();

module.exports = {
  warAlertNotification(bot) {
    cron.schedule('* * * * *', async () => {
      const statesOld = statesCache.get('states');
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
            result.enabled.push(state);
          } else if (!statesNew[state].enabled && statesOld[state].enabled) {
            result.disabled.push(state);
          }
          const districts = Object.keys(state.districts);
          for (const district of districts) {
            if (
              statesNew[state].districts[district].enabled
              && !statesOld[state].districts[district].enabled
            ) {
              result.enabled.push(district);
            } else if (
              !statesNew[state].districts[district].enabled
              && statesOld[state].districts[district].enabled
            ) {
              result.disabled.push(district);
            }
          }
        }
      } else {
        for (const state of states) {
          if (statesNew[state].enabled) {
            result.enabled.push(state);
          }
          const districts = Object.keys(state.districts);
          for (const district of districts) {
            if (statesNew[state].districts[district].enabled) {
              result.enabled.push(district);
            }
          }
        }
      }

      if (states.length) statesCache.set('states', statesNew, 600000);

      let reply = '';
      if (result.enabled.length) {
        reply += '🛑Увага! Повітряна тривога.🛑\n';
        for (const state of result.enabled) {
          reply += `‼️ ${state}.\n`;
        }
      }
      if (result.disabled.length) {
        reply += '🟩Відбій повітряної тривоги.🟩\n';
        for (const state of result.disabled) {
          reply += `‼️ ${state}.\n`;
        }
      }

      const users = await usersManager.getAllUsers()
        .catch((e) => {
          console.error('cronController warAlertNotification usersManager getAllUsers error:', e.message);
        });

      if (reply) {
        for await (const user of users) {
          await cronHelper.sendMessageWithBlockCheck(bot, user, reply)
            .catch((e) => {
              console.error('cronController warAlertNotification cronHelper sendMessageWithBlockCheck error:', e.message);
            });
        }
      }
    });
  },
};
