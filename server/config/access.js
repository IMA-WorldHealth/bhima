const _ = require('lodash');
const debug = require('debug')('app');
const JWTConfig = require('./jwt');
const { Unauthorized } = require('../lib/errors');

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
  app.use((req, res, next) => {
    const token = req.headers['x-access-token'];
    let sessionExists = true;

    if (token) {
      JWTConfig.verify(req, (session) => {
        if (!session) {
          sessionExists = false;
          return;
        }
        _.merge(req.session, session);
      }, (error) => {
        sessionExists = false;
        debug(error);
      });
    }

    if (!sessionExists) {
      debug(`Rejecting due to invalid session token`);
      next(new Unauthorized('The session token is not valid'));
    }

    if (_.isUndefined(req.session.user) && !within(req.path, publicRoutes)) {
      debug(`Rejecting unauthorized access to ${req.path} from ${req.ip}`);
      next(new Unauthorized('You are not logged into the system.'));
    }

    // go to the next middleware
    next();

  });

};

// quick way to find out if a value is in an array
function within(value, array) { return array.includes(value.trim()); }
