const callbackActions = require('../constants/callbackActions');
const regionsHelper = require('./regionsHelper');

function buildRegionsKeyboard(regions, subscribedRegions, page = 0) {
  const perPage = regionsHelper.REGIONS_PER_PAGE;
  const totalPages = regionsHelper.getTotalPages(regions);
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * perPage;
  const pageRegions = regions.slice(start, start + perPage);

  const rows = pageRegions.map((region, index) => {
    const regionIndex = start + index;
    const isSubscribed = subscribedRegions.includes(region);
    const prefix = isSubscribed ? '✅' : '⬜';

    return [{
      text: `${prefix} ${region}`,
      callback_data: `${callbackActions.REGION_TOGGLE_PREFIX}${regionIndex}`,
    }];
  });

  const navigation = [];
  if (safePage > 0) {
    navigation.push({
      text: '⬅️ Назад',
      callback_data: `${callbackActions.REGION_PAGE_PREFIX}${safePage - 1}`,
    });
  }

  navigation.push({
    text: `${safePage + 1} / ${totalPages}`,
    callback_data: callbackActions.REGION_NOOP,
  });

  if (safePage < totalPages - 1) {
    navigation.push({
      text: 'Далі ➡️',
      callback_data: `${callbackActions.REGION_PAGE_PREFIX}${safePage + 1}`,
    });
  }

  rows.push(navigation);

  return {
    reply_markup: {
      inline_keyboard: rows,
    },
    page: safePage,
  };
}

function buildSubscriptionSummary(regions) {
  if (!regions.length) {
    return 'Ви ще не підписані на жодну область.\nОберіть області нижче, щоб отримувати сповіщення про тривогу.';
  }

  const list = regions.map((region) => `🔹 ${region}`).join('\n');
  return `*Ваші підписки:*\n${list}\n\n_Натисніть на область, щоб увімкнути або вимкнути сповіщення._`;
}

module.exports = {
  buildRegionsKeyboard,
  buildSubscriptionSummary,
};
