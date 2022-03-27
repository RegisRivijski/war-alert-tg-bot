const config = require('config');
const axios = require('axios');

const vadimklimenkoOrigin = `${config.rest.vadimklimenko.protocol}//${config.rest.vadimklimenko.host}`;

module.exports = {
  getActiveAlertsVC() {
    return axios.get(`${vadimklimenkoOrigin}/map/statuses.json`, {
      timeout: 30000,
    })
      .then((response) => response.data);
  },
};
