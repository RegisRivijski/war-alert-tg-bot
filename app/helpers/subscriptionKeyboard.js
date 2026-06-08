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
    return '*Підписка на області*\n\n'
      + 'Ви ще не обрали жодну область.\n'
      + 'Натисніть на область нижче, щоб увімкнути сповіщення про тривогу.\n\n'
      + '_Переглянути поточний статус —_ /waralertmysubscriptions';
  }

  const list = regions.map((region) => `✅ ${region}`).join('\n');
  return `*Підписка на області*\n\n`
    + `*Обрані області:*\n${list}\n\n`
    + '_Натисніть на область, щоб увімкнути або вимкнути сповіщення._\n'
    + '_Переглянути поточний статус —_ /waralertmysubscriptions';
}

module.exports = {
  buildRegionsKeyboard,
  buildSubscriptionSummary,
};
