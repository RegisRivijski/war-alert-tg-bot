const umami = require('../classes/UmamiSingleton');

module.exports = {
  logEvent(input) {
    return umami.logEvent(input);
  },
};
