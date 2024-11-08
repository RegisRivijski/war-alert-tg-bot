const standardController = require('../controllers/standard');
const warAlertController = require('../controllers/warAlert');
const usersMiddleware = require('../middlewares/users');
const errorsHandler = require('../middlewares/errorsHandler');

module.exports = (bot) => {
  bot
    .use(errorsHandler.onError)
    .command('start', usersMiddleware.canReply, standardController.start, warAlertController.warAlertCheckAll)
    .command('help', usersMiddleware.canReply, standardController.help)

    // War alerts
    .command('waralertcheckall', usersMiddleware.canReply, warAlertController.warAlertCheckAll)
    .command('waralertchecksafe', usersMiddleware.canReply, warAlertController.warAlertCheckSafe);
};
