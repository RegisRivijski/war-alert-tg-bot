const warAlertManager = require('../managers/warAlert');

module.exports = {
  async getActiveAlertsVC() {
    const result = [];
    const statesNew = await warAlertManager.getActiveAlertsVC()
      .then((data) => data.states)
      .catch((e) => {
        console.error('warAlertHelper getActiveAlertsVC error:', e.message);
        throw e;
      });

    const states = Object.keys(statesNew);
    for (const state of states) {
      const stateData = statesNew[state];

      if (stateData.enabled) {
        result.push({
          state,
          district: '',
          enabled_at: stateData.enabled_at,
        });
      }

      const districts = Object.keys(stateData.districts);
      for (const district of districts) {
        const districtData = stateData.districts[district];
        if (districtData.enabled) {
          result.push({
            state,
            district,
            enabled_at: districtData.enabled_at,
          });
        }
      }
    }
    return result;
  },

  async getInactiveAlertsVC() {
    const result = [];
    const statesNew = await warAlertManager.getActiveAlertsVC()
      .then((data) => data.states)
      .catch((e) => {
        console.error('warAlertHelper getInactiveAlertsVC error:', e.message);
        throw e;
      });

    const states = Object.keys(statesNew);
    for (const state of states) {
      const stateData = statesNew[state];
      const districts = Object.keys(stateData.districts);

      let hasActiveDistrictAlerts = false;
      const inactiveDistricts = [];

      for (const district of districts) {
        const districtData = stateData.districts[district];
        if (!districtData.enabled) {
          inactiveDistricts.push({
            state,
            district,
            disabled_at: districtData.disabled_at,
          });
        } else {
          hasActiveDistrictAlerts = true;
        }
      }

      if (!hasActiveDistrictAlerts && !stateData.enabled) {
        result.push({
          state,
          district: '',
          disabled_at: stateData.disabled_at,
        });
      } else {
        result.push(...inactiveDistricts);
      }
    }
    return result;
  },

  groupByState(alerts) {
    const map = {};
    for (const alert of alerts) {
      if (!map[alert.state]) {
        map[alert.state] = { stateTime: null, districts: [] };
      }

      if (!alert.district) {
        map[alert.state].stateTime = alert.time;
      } else {
        map[alert.state].districts.push({ district: alert.district, time: alert.time });
      }
    }
    return map;
  },
};
