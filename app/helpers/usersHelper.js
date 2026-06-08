const UsersModel = require('../models/users');

function getChatIdFromCtx(ctx) {
  if (ctx.update?.callback_query) {
    return ctx.update.callback_query.from.id;
  }
  return ctx.update?.message?.from?.id || ctx.chat?.id;
}

function getUserMetaFromCtx(ctx) {
  const from = ctx.update?.callback_query?.from || ctx.update?.message?.from || {};
  return {
    firstName: from.first_name || '',
    username: from.username || '',
  };
}

module.exports = {
  getChatIdFromCtx,

  async ensureUser(ctx) {
    const chatId = getChatIdFromCtx(ctx);
    if (!chatId) {
      return null;
    }

    const meta = getUserMetaFromCtx(ctx);
    const user = await UsersModel.findOneAndUpdate(
      { chatId },
      {
        $set: {
          firstName: meta.firstName,
          username: meta.username,
          isActive: true,
        },
        $setOnInsert: {
          chatId,
          regions: [],
        },
      },
      { upsert: true, new: true },
    );

    return user;
  },

  async toggleRegion(chatId, region) {
    const user = await UsersModel.findOne({ chatId });
    if (!user) {
      return null;
    }

    const hasRegion = user.regions.includes(region);
    if (hasRegion) {
      user.regions = user.regions.filter((item) => item !== region);
    } else {
      user.regions.push(region);
    }

    await user.save();
    return user;
  },

  async findActiveByRegions(regions) {
    if (!regions.length) {
      return [];
    }

    return UsersModel.find({
      isActive: true,
      regions: { $in: regions },
    }).lean();
  },

  async deactivateUser(chatId) {
    await UsersModel.updateOne({ chatId }, { $set: { isActive: false } });
  },
};
