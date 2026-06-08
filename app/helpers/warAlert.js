const { formatTime } = require('./timeHelper');

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
          time: formatTime(stateData.enabled_at),
        });
      }

      const districts = Object.keys(stateData.districts);
      for (const district of districts) {
        const districtData = stateData.districts[district];
        if (districtData.enabled) {
          result.push({
            state,
            district,
            time: formatTime(districtData.enabled_at),
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
            time: formatTime(districtData.disabled_at),
          });
        } else {
          hasActiveDistrictAlerts = true;
        }
      }

      if (!hasActiveDistrictAlerts && !stateData.enabled) {
        result.push({
          state,
          district: '',
          time: formatTime(stateData.disabled_at),
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

  buildSafeRegionsReply(safeRegions) {
    if (!safeRegions.length) {
      return '🔴 На даний момент повітряна тривога оголошена у всіх регіонах України.\n';
    }

    let reply = '\n🟢 *Відбій повітряної тривоги!* 🟢\n';

    const grouped = this.groupByState(safeRegions);

    for (const state of Object.keys(grouped)) {
      const entry = grouped[state];
      reply += `\n🟩 *${state}*`;

      if (entry.stateTime) {
        reply += `\n — _відбій: ${entry.stateTime}_`;
      }

      for (const d of entry.districts) {
        reply += `\n   🔹 ${d.district}`;
        if (d.time) {
          reply += `\n     — _відбій: ${d.time}_`;
        }
      }
    }

    reply += '\n\n👤 _Можете покинути укриття, але залишайтесь обережними._\n';

    return reply;
  },

  getStateAlertStatus(stateData) {
    if (stateData.enabled) {
      return {
        hasAlert: true,
        stateLevel: true,
        time: formatTime(stateData.enabled_at),
        districts: [],
      };
    }

    const districts = Object.keys(stateData.districts || {});
    const activeDistricts = districts
      .filter((district) => stateData.districts[district].enabled)
      .map((district) => ({
        district,
        time: formatTime(stateData.districts[district].enabled_at),
      }));

    if (activeDistricts.length) {
      return {
        hasAlert: true,
        stateLevel: false,
        districts: activeDistricts,
      };
    }

    return {
      hasAlert: false,
      time: formatTime(stateData.disabled_at),
    };
  },

  buildSubscribedRegionsStatusReply(subscribedRegions, statesData) {
    if (!subscribedRegions.length) {
      return '*Статус підписаних областей*\n\n'
        + 'Ви ще не підписані на жодну область.\n'
        + 'Оберіть області командою /waralertsubscribe, щоб отримувати сповіщення та переглядати їхній статус.';
    }

    let reply = '*Статус ваших підписаних областей:*\n';
    let hasAnyAlert = false;

    for (const region of subscribedRegions) {
      const stateData = statesData[region];

      if (!stateData) {
        reply += `\n❓ *${region}*\n — _дані недоступні_`;
      } else {
        const status = this.getStateAlertStatus(stateData);

        if (status.hasAlert) {
          hasAnyAlert = true;
          reply += `\n\n🟥 *${region}* — _тривога_`;

          if (status.stateLevel && status.time) {
            reply += `\n — _оголошено: ${status.time}_`;
          }

          for (const district of status.districts) {
            reply += `\n   🔸 ${district.district}`;
            if (district.time) {
              reply += `\n     — _оголошено: ${district.time}_`;
            }
          }
        } else {
          reply += `\n\n🟩 *${region}* — _без тривоги_`;
          if (status.time) {
            reply += `\n — _відбій: ${status.time}_`;
          }
        }
      }
    }

    if (hasAnyAlert) {
      reply += '\n\n⚠️ _Рекомендуємо негайно перейти в укриття!_';
    } else {
      reply += '\n\n🕊️ _У ваших підписаних областях зараз без тривоги._';
    }

    reply += '\n\n_Змінити підписки —_ /waralertsubscribe';

    return reply;
  },

  buildAlertRegionsReply(alerts) {
    if (!alerts.length) {
      return '🟢 На даний момент повітряна тривога відсутня по всіх областях України. Спокійного дня! 🕊️\n';
    }

    let reply = '🚨 *Повітряна тривога оголошена!* 🚨\n';

    const grouped = this.groupByState(alerts);

    for (const state of Object.keys(grouped)) {
      const entry = grouped[state];
      reply += `\n🟥 *${state}*`;

      if (entry.stateTime) {
        reply += `\n — _оголошено: ${entry.stateTime}_`;
      }

      for (const d of entry.districts) {
        reply += `\n   🔸 ${d.district}`;
        if (d.time) {
          reply += `\n     — _оголошено: ${d.time}_`;
        }
      }
    }

    reply += '\n\n⚠️ _Рекомендуємо негайно перейти в укриття!_\n';

    return reply;
  },
};
