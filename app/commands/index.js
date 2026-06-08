const standardController = require('../controllers/standard');
const subscriptionController = require('../controllers/subscription');
const warAlertController = require('../controllers/warAlert');
const usersMiddleware = require('../middlewares/users');
const errorsHandler = require('../middlewares/errorsHandler');

module.exports = (bot) => {
  bot
    .use(errorsHandler.onError)
    .command('start', usersMiddleware.canReply, usersMiddleware.ensureUser, standardController.start, warAlertController.warAlertCheckAll)
    .command('help', usersMiddleware.canReply, usersMiddleware.ensureUser, standardController.help)

    // War alerts
    .command('waralertcheckall', usersMiddleware.canReply, usersMiddleware.ensureUser, warAlertController.warAlertCheckAll)
    .command('waralertchecksafe', usersMiddleware.canReply, usersMiddleware.ensureUser, warAlertController.warAlertCheckSafe)
    .command('waralertsubscribe', usersMiddleware.canReply, usersMiddleware.ensureUser, subscriptionController.warAlertSubscribe)
    .command('waralertmysubscriptions', usersMiddleware.canReply, usersMiddleware.ensureUser, subscriptionController.warAlertMySubscriptions)
    .action(/^rgn:(t:\d+|p:\d+|nop)$/, usersMiddleware.ensureUser, subscriptionController.onRegionCallback);
};
