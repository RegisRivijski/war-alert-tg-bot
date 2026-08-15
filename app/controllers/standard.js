const analyticEventTypes = require('../constants/analyticEventTypes');

const analyticsManager = require('../managers/analyticsManager');

module.exports = {

  async start(ctx, next) {
    const reply = '*Вітаємо!*\n\n'
      + 'Даний бот оперативно інформує про повітряну тривогу у різних областях України.\n'
      + '💡 _Бот надає точну та актуальну інформацію про поточний статус тривог, що дозволяє залишатись у безпеці._\n\n'
      + '*Доступні команди:*\n'
      + '🔹 /waralertsubscribe – _обрати області для персональних сповіщень._\n'
      + '🔹 /waralertmysubscriptions – _переглянути статус підписаних областей._\n'
      + '🔹 /waralertcheckall – _перевірити повітряну тривогу по всій Україні._\n'
      + '🔹 /waralertchecksafe – _перевірити області без тривоги._\n\n'
      + '🛡️ Бот працює цілодобово і оперативно надсилає сповіщення лише по обраних вами областях.\n'
      + 'Залишайтеся в безпеці і слідкуйте за повідомленнями!\n';

    await ctx.reply(reply, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('standardController start ctx reply:', e.message);
        throw e;
      });

    analyticsManager.logEvent({
      eventType: analyticEventTypes.START,
      userId: ctx.update?.message?.from?.id,
      ctx,
    })
      .catch((e) => {
        console.error('standardController start analyticsManager logEvent:', e.message);
      });

    await next();
  },

  async help(ctx, next) {
    const reply = '*Команди бота:*\n\n'
      + '🔹 /waralertsubscribe – _обрати області для персональних сповіщень._\n'
      + '🔹 /waralertmysubscriptions – _переглянути статус підписаних областей._\n'
      + '🔹 /waralertcheckall – _отримати поточну інформацію про повітряну тривогу по усій Україні._\n'
      + '🔹 /waralertchecksafe – _перевірити області без тривоги._\n\n'
      + '❗ *Інформація оновлюється в режимі реального часу*, що забезпечує оперативність даних.\n'
      + 'У разі надзвичайної ситуації – залишайтесь у безпечному місці і слідкуйте за оновленнями.\n'
      + '\n_Бот розроблено для інформування громадян про поточні загрози, з метою підвищення вашої безпеки._';

    await ctx.reply(reply, { parse_mode: 'Markdown' })
      .catch((e) => {
        console.error('help reply:', e.message);
        throw e;
      });

    analyticsManager.logEvent({
      eventType: analyticEventTypes.HELP,
      userId: ctx.update?.message?.from?.id,
      ctx,
    })
      .catch((e) => {
        console.error('standardController start analyticsManager logEvent:', e.message);
      });

    await next();
  },
};
