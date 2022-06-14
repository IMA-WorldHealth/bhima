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
      let _error = {};
      JWTConfig.verify(req, (decoded) => {
        if (!decoded) {
          sessionExists = false;
          return;
        }
        req.session.enterprise = decoded.enterprise;
        req.session.project = decoded.project;
        req.session.user = decoded.user;
      }, (error) => {
        sessionExists = false;
        _error = error;
      });
    }

    if (sessionExists) {
      if (_.isUndefined(req.session.user) && !within(req.path, publicRoutes)) {
        debug(`Rejecting unauthorized access to ${req.path} from ${req.ip}`);
        next(new Unauthorized('You are not logged into the system.'));
      } else {
        next();
      }
    } else {
      debug('token not valide', _error);
      res.status(401).json({
        msg : 'token not valid'
      });
    }
  });

}

// quick way to find out if a value is in an array
function within(value, array) { return array.includes(value.trim()); }
