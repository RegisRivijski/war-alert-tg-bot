const warAlertManager = require('../managers/warAlert');

module.exports = {
  // Метод для получения активных тревог
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

      // Проверка и добавление активных тревог для регионов
      if (stateData.enabled) {
        result.push({
          state,
          district: '',
          enabled_at: stateData.enabled_at,
        });
      }

      // Проверка и добавление активных тревог для районов
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

  // Метод для получения неактивных тревог с учетом состояния всех районов области
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

      // Флаг для отслеживания, есть ли активные тревоги в районах области
      let hasActiveDistrictAlerts = false;
      const inactiveDistricts = [];

      // Проверяем каждый район на наличие активной тревоги
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

      // Если во всех районах тревога отключена, добавляем только область
      if (!hasActiveDistrictAlerts && !stateData.enabled) {
        result.push({
          state,
          district: '',
          disabled_at: stateData.disabled_at,
        });
      } else {
        // Если хотя бы в одном районе тревога включена, добавляем каждый неактивный район отдельно
        result.push(...inactiveDistricts);
      }
    }
    return result;
  },
};
