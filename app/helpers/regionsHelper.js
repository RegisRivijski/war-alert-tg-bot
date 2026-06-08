const NodeCache = require('node-cache');

const warAlertManager = require('../managers/warAlert');

const regionsCache = new NodeCache({ stdTTL: 3600 });

const REGIONS_CACHE_KEY = 'ukraineRegions';
const REGIONS_PER_PAGE = 6;

module.exports = {
  REGIONS_PER_PAGE,

  async getRegionsList() {
    const cached = regionsCache.get(REGIONS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const states = await warAlertManager.getActiveAlertsVC()
      .then((data) => Object.keys(data.states || {}))
      .catch((error) => {
        console.error('regionsHelper getRegionsList error:', error.message);
        return [];
      });

    const sorted = states.sort((a, b) => a.localeCompare(b, 'uk'));
    if (sorted.length) {
      regionsCache.set(REGIONS_CACHE_KEY, sorted);
    }

    return sorted;
  },

  getRegionByIndex(regions, index) {
    if (index < 0 || index >= regions.length) {
      return null;
    }
    return regions[index];
  },

  getTotalPages(regions) {
    return Math.max(1, Math.ceil(regions.length / REGIONS_PER_PAGE));
  },
};
