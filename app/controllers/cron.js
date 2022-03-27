const cron = require('node-cron');
const NodeCache = require('node-cache');
const warAlertManager = require('../managers/warAlert');
const usersManager = require('../managers/users');
const cronHelper = require('../helpers/cron');

const statesCache = new NodeCache();

module.exports = {
  warAlertNotification(bot) {
    cron.schedule('*/2 * * * *', async () => {
      const statesOld = statesCache.get('states');
      const statesNew = await warAlertManager.getActiveAlertsVC()
        .then((data) => data.states)
        .catch((e) => {
          console.error('cronController warAlertNotification warAlertManager getActiveAlertsVC error:', e.message);
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
        }
      } else {
        for (const state of states) {
          if (statesNew[state].enabled) {
            result.enabled.push(state);
          }
        }
      }

      statesCache.set('states', statesNew, 180000);

      let reply;
      if (result.enabled.length) {
        reply = 'Повітряна тривога:\n';
        for (const state of result.enabled) {
          reply += `‼️ ${state}.\n`;
        }
      }
      if (result.disabled.length) {
        reply += 'Відбій повітрянної тривоги:\n';
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
