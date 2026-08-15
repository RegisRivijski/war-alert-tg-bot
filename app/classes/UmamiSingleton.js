const { createTelegramTracker } = require('umami-server-tracker');
const config = require('config');

const { host, websiteId, hostname = 'war-alert' } = config.analytics?.umami || {};

module.exports = createTelegramTracker({
  host,
  websiteId,
  hostname,
  defaultCountry: 'UA',
  languageCountry: { ru: 'UA' },
});
