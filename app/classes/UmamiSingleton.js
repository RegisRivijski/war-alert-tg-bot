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

const LANGUAGE_COUNTRY = {
  uk: 'UA',
  ru: 'UA',
  be: 'BY',
  pl: 'PL',
  en: 'US',
  de: 'DE',
  ro: 'RO',
  hu: 'HU',
  sk: 'SK',
  cs: 'CZ',
  bg: 'BG',
  tr: 'TR',
};

const SCRIPT_SUBTAGS = new Set(['hans', 'hant', 'latn', 'cyrl']);

function countryFromLanguage(language) {
  if (!language) {
    return 'UA';
  }

  const parts = String(language).trim().replace('_', '-').split('-');
  const lang = parts[0].toLowerCase();
  const region = parts.slice(1).find((part) => (
    part.length === 2 && !SCRIPT_SUBTAGS.has(part.toLowerCase())
  ));

  if (region) {
    return region.toUpperCase();
  }

  return LANGUAGE_COUNTRY[lang] || 'UA';
}

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
    language,
    country,
  }) {
    if (!client || !websiteId || !eventType) {
      return Promise.resolve();
    }

    const resolvedCountry = (country || countryFromLanguage(language) || 'UA').toUpperCase();
    const payload = {
      website: websiteId,
      hostname,
      language: language || undefined,
      url: `/${String(eventType).slice(0, 50)}`,
      name: String(eventType).slice(0, 50),
      id: userId === undefined || userId === null ? undefined : String(userId),
      data: sanitizeData({
        ...eventProperties,
        country: resolvedCountry,
      }),
    };

    return client
      .post('/api/send', { type: 'event', payload }, {
        headers: {
          'CF-IPCountry': resolvedCountry,
          'X-Forwarded-For': '1.1.1.1',
        },
      })
      .then(() => undefined)
      .catch(() => undefined);
  },
};
