const config = require('config');

const { init, OfflineRetryHandler } = '@amplitude/node';

const apiKey = config.analytics.Amplitude.key;

const client = init(apiKey, {
  retryClass: new OfflineRetryHandler(apiKey),
});

module.exports = client;
