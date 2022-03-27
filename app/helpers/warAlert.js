const warAlertManager = require('../managers/warAlert');

module.exports = {

  async getActiveAlertsUkrzen() {
    const result = [];
    const ukrzen = await warAlertManager.getActiveAlertsUkrzen()
      .catch((e) => {
        console.error('warAlertHelper getActiveAlerts warAlertManager getActiveAlertsUkrzen error:', e.message);
        throw e;
      });
    for (const alert of ukrzen.alerts) {
      result.push(alert.location_title);
    }
    return result;
  },

  async getActiveAlertsVC() {
    const result = [];
    const vcAlerts = await warAlertManager.getActiveAlertsVC()
      .catch((e) => {
        console.error('warAlertHelper getActiveAlerts warAlertManager getActiveAlertsVC error:', e.message);
        throw e;
      });

    const states = Object.keys(vcAlerts.states);

    for (const state of states) {
      if (vcAlerts.states[state].enabled) {
        result.push(state);
      }
    }
    return result;
  },
};
