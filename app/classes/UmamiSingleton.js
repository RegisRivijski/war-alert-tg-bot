const axios = require('axios');
const config = require('config');

const { host: rawHost, websiteId, hostname = 'war-alert' } = config.analytics?.umami || {};
const host = String(rawHost || '').replace(/\/$/, '');

const client = host
  ? axios.create({
    baseURL: host,
    timeout: 2500,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; WarAlertBot/1.0)',
    },
  })
  : null;

function sanitizeData(eventProperties) {
  if (!eventProperties || typeof eventProperties !== 'object' || Array.isArray(eventProperties)) {
    return undefined;
  }

  const data = {};
  Object.entries(eventProperties).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      data[key] = value;
      return;
    }
    data[key] = JSON.stringify(value).slice(0, 500);
  });

  return Object.keys(data).length ? data : undefined;
}

module.exports = {
  logEvent({
    event_type: eventType,
    user_id: userId,
    event_properties: eventProperties,
  }) {
    if (!client || !websiteId || !eventType) {
      return Promise.resolve();
    }

    const payload = {
      website: websiteId,
      hostname,
      url: `/${String(eventType).slice(0, 50)}`,
      name: String(eventType).slice(0, 50),
      id: userId === undefined || userId === null ? undefined : String(userId),
      data: sanitizeData(eventProperties),
    };

    return client.post('/api/send', { type: 'event', payload }).then(() => undefined).catch(() => undefined);
  },
};
