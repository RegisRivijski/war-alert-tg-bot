const warAlertManager = require('../managers/warAlert');

module.exports = {

  async getActiveAlertsVC() {
    const result = [];
    const statesNew = await warAlertManager.getActiveAlertsVC()
      .then((data) => data.states)
      .catch((e) => {
        console.error('warAlertHelper getActiveAlerts warAlertManager getActiveAlertsVC error:', e.message);
        throw e;
      });

    const states = Object.keys(statesNew);
    for (const state of states) {
      if (statesNew[state].enabled) {
        result.push({
          state,
          district: '',
        });
      }
      const districts = Object.keys(statesNew[state].districts);
      for (const district of districts) {
        if (statesNew[state].districts[district].enabled) {
          result.push({
            state,
            district,
          });
        }
      }
    }
    return result;
  },
};
