const config = require('config');

const Amplitude = '@amplitude/node';

const apiKey = config.analytics.Amplitude.key;

const client = Amplitude.init(apiKey);

module.exports = client;
