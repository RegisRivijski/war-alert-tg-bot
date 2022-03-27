const usersModel = require('../managers/models/users');

module.exports = {

  getUserName(ctx) {
    return ctx.update.message.from?.username
      ? `@${ctx.update.message.from?.username}`
      : ctx.update.message.from?.first_name;
  },

  async getUserInfo(ctx) {
    const chatId = ctx.update.message.from?.id;
    let userInfo = await usersModel.findOne({ chatId })
      .catch((e) => {
        console.error('usersHelper getUserInfo usersModel findOne:', e);
        throw e;
      });

    if (!userInfo) {
      userInfo = await usersModel.insertMany([{ chatId }])
        .then((response) => response[0])
        .catch((e) => {
          console.error('usersHelper getUserInfo usersModel insertMany:', e);
          throw e;
        });
    }

    return userInfo;
  },
};
