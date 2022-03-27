const usersModel = require('./models/users');

module.exports = {

  getAllUsers() {
    return usersModel.find({});
  },
};
