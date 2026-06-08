const analyticEventTypes = require('../constants/analyticEventTypes');
const callbackActions = require('../constants/callbackActions');

const regionsHelper = require('../helpers/regionsHelper');
const subscriptionKeyboard = require('../helpers/subscriptionKeyboard');
const usersHelper = require('../helpers/usersHelper');
const warAlertHelper = require('../helpers/warAlert');
const warAlertManager = require('../managers/warAlert');

const analyticsManager = require('../managers/analyticsManager');

async function showSubscriptionMenu(ctx, page = 0, edit = false) {
  const user = await usersHelper.ensureUser(ctx);
  const regions = await regionsHelper.getRegionsList();

  if (!regions.length) {
    await ctx.reply('Не вдалося завантажити список областей. Спробуйте пізніше.')
      .catch((error) => {
        console.error('subscriptionController showSubscriptionMenu reply error:', error.message);
      });
    return;
  }

  const keyboard = subscriptionKeyboard.buildRegionsKeyboard(regions, user.regions, page);
  const text = subscriptionKeyboard.buildSubscriptionSummary(user.regions);

  if (edit && ctx.update?.callback_query) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup,
    }).catch(async (error) => {
      console.error('subscriptionController showSubscriptionMenu edit error:', error.message);
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup,
      }).catch((replyError) => {
        console.error('subscriptionController showSubscriptionMenu fallback reply error:', replyError.message);
      });
    });
    return;
  }

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard.reply_markup,
  }).catch((error) => {
    console.error('subscriptionController showSubscriptionMenu reply error:', error.message);
  });
}

module.exports = {
  async warAlertSubscribe(ctx, next) {
    await usersHelper.ensureUser(ctx);
    await showSubscriptionMenu(ctx);

    analyticsManager.logEvent({
      eventType: analyticEventTypes.SUBSCRIBE_MENU,
      userId: usersHelper.getChatIdFromCtx(ctx),
    }).catch((error) => {
      console.error('subscriptionController warAlertSubscribe analytics error:', error.message);
    });

    await next();
  },

  async warAlertMySubscriptions(ctx, next) {
    const user = await usersHelper.ensureUser(ctx);
    const statesData = await warAlertManager.getActiveAlertsVC()
      .then((data) => data.states || {})
      .catch((error) => {
        console.error('subscriptionController warAlertMySubscriptions getActiveAlertsVC error:', error.message);
        return null;
      });

    let text;
    if (!statesData) {
      text = 'Не вдалося завантажити статус тривоги. Спробуйте пізніше.';
    } else {
      text = warAlertHelper.buildSubscribedRegionsStatusReply(user.regions, statesData);
    }

    await ctx.reply(text, { parse_mode: 'Markdown' })
      .catch((error) => {
        console.error('subscriptionController warAlertMySubscriptions reply error:', error.message);
      });

    analyticsManager.logEvent({
      eventType: analyticEventTypes.MY_SUBSCRIPTIONS,
      userId: usersHelper.getChatIdFromCtx(ctx),
    }).catch((error) => {
      console.error('subscriptionController warAlertMySubscriptions analytics error:', error.message);
    });

    await next();
  },

  async onRegionCallback(ctx) {
    const data = ctx.update?.callback_query?.data || '';
    await usersHelper.ensureUser(ctx);
    await ctx.answerCbQuery().catch(() => {});

    if (data === callbackActions.REGION_NOOP) {
      return;
    }

    const regions = await regionsHelper.getRegionsList();
    let page = 0;

    if (data.startsWith(callbackActions.REGION_PAGE_PREFIX)) {
      page = Number.parseInt(data.slice(callbackActions.REGION_PAGE_PREFIX.length), 10) || 0;
      await showSubscriptionMenu(ctx, page, true);
      return;
    }

    if (data.startsWith(callbackActions.REGION_TOGGLE_PREFIX)) {
      const regionIndex = Number.parseInt(
        data.slice(callbackActions.REGION_TOGGLE_PREFIX.length),
        10,
      );
      const region = regionsHelper.getRegionByIndex(regions, regionIndex);

      if (!region) {
        await ctx.answerCbQuery('Область не знайдено').catch(() => {});
        return;
      }

      const chatId = usersHelper.getChatIdFromCtx(ctx);
      await usersHelper.toggleRegion(chatId, region);

      page = Math.floor(regionIndex / regionsHelper.REGIONS_PER_PAGE);
      await showSubscriptionMenu(ctx, page, true);

      analyticsManager.logEvent({
        eventType: analyticEventTypes.TOGGLE_REGION,
        userId: chatId,
      }).catch((error) => {
        console.error('subscriptionController onRegionCallback analytics error:', error.message);
      });
    }
  },
};
