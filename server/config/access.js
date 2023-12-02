const _ = require('lodash');
const debug = require('debug')('app');
const JWTConfig = require('./jwt');
const { Unauthorized } = require('../lib/errors');
const { loadSessionInformation } = require('../controllers/auth');

const publicRoutes = [
  '/auth/login',
  '/helpdesk_info',
  '/languages',
  '/projects',
  '/projects/',
  '/auth/logout',
  '/install',
  '/currencies',
];

module.exports = (app) => {
  // eslint-disable-next-line consistent-return
  app.use(async (req, res, next) => {
    const token = req.headers['x-access-token'];
    try {

      if (token) {
        const user = await JWTConfig.verify(token);
        const session = await loadSessionInformation(user);
        _.merge(req.session, session);
      }

      if (_.isUndefined(req.session.user) && !within(req.path, publicRoutes)) {
        debug(`Rejecting unauthorized access to ${req.path} from ${req.ip}`);
        next(new Unauthorized('You are not logged into the system.'));
      }

      // go to the next middleware
      next();
    } catch (err) {
      next(err);
    }
  });

};

// quick way to find out if a value is in an array
function within(value, array) { return array.includes(value.trim()); }
