const usersModel = require('./models/users');

module.exports = {

  getAllActiveUsers() {
    return usersModel.find({
      isBlocked: false,
    });
  },

  getAllUsers() {
    return usersModel.find({});
  },

  getUserByChatId(chatId) {
    return usersModel.findOne({ chatId });
  },
};
