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

function visitorIp(userId) {
  const n = Math.abs(Number(userId)) || 1;
  const c = Math.floor(n / 254) % 256;
  const d = (n % 254) + 1;
  return `198.51.${c}.${d}`;
}

function visitorUserAgent(userId) {
  const uid = encodeURIComponent(String(userId || 'anon'));
  return `Mozilla/5.0 (KHTML, like Gecko) Telegram/11.0 uid/${uid}`;
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
    const userAgent = visitorUserAgent(userId);
    const payload = {
      website: websiteId,
      hostname,
      language: language || undefined,
      url: `/${String(eventType).slice(0, 50)}`,
      name: String(eventType).slice(0, 50),
      id: userId === undefined || userId === null ? undefined : String(userId),
      userAgent,
      data: sanitizeData({
        ...eventProperties,
        country: resolvedCountry,
      }),
    };

    const headers = {
      'User-Agent': userAgent,
      'CF-IPCountry': resolvedCountry,
      'X-Forwarded-For': userId === undefined || userId === null || userId === ''
        ? '1.1.1.1'
        : visitorIp(userId),
    };

    return client
      .post('/api/send', { type: 'event', payload }, { headers })
      .then(() => undefined)
      .catch(() => undefined);
  },
};
