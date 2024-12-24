const config = require('config');

// eslint-disable-next-line import/no-extraneous-dependencies
const Amplitude = require('@amplitude/node');

const apiKey = config.analytics.Amplitude.key;

const client = Amplitude.init(apiKey, {
  retryClass: new Amplitude.OfflineRetryHandler(apiKey),
});

module.exports = client;
