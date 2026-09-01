const cron = require('node-cron');
const NodeCache = require('node-cache');

const { formatTime } = require('../helpers/timeHelper');
const notificationHelper = require('../helpers/notificationHelper');
const warAlertManager = require('../managers/warAlert');

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
          const stateDataNew = statesNew[state];
          const stateDataOld = statesOld[state] || {};

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
              result.enabled.push({
                state,
                district,
                time: formatTime(districtDataNew.enabled_at),
              });
            }
          }
        }
      }

      if (states.length) {
        statesCache.set('states', statesNew);
      }

      // Channel posts moved to channel-automation-tg-bot.
      await notificationHelper.notifySubscribedUsers(bot, result, Boolean(statesOld))
        .catch((e) => {
          console.error('cron warAlertNotification notifySubscribedUsers:', e.message);
        });
    });
  },
};
