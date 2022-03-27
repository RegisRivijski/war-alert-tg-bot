const config = require('config');
const axios = require('axios');

const ukrzenWarOrigin = `${config.rest.ukrzen.protocol}//${config.rest.ukrzen.host}/alerts/api`;
const vadimklimenkoOrigin = `${config.rest.vadimklimenko.protocol}//${config.rest.vadimklimenko.host}`;

module.exports = {
  getActiveAlertsUkrzen() {
    return axios.get(`${ukrzenWarOrigin}/alerts/active.json`, {
      timeout: 10000,
    })
      .then((response) => response.data);
  },
  getActiveAlertsVC() {
    return axios.get(`${vadimklimenkoOrigin}/map/statuses.json`, {
      timeout: 15000,
    })
      .then((response) => response.data);
  },
};
