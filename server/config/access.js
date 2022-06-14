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

const assetRoutes = [
  '/index.html',
  '/css/',
  '/js/',
  '/assets/',
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

    if (sessionExists) {
      if (_.isUndefined(req.session.user) && !within(req.path, publicRoutes) && !withinAsset(req.path, assetRoutes)) {
        debug(`Rejecting unauthorized access to ${req.path} from ${req.ip}`);
        next(new Unauthorized('You are not logged into the system.'));
      } else {
        next();
      }
    } else {
      debug('token not valide');
      res.status(401).json({
        msg : 'token not valid',
      });
    }
  });

};

// quick way to find out if a value is in an array
function within(value, array) { return array.includes(value.trim()); }

// quick way to find out if a value is in an array
function withinAsset(value, array) { return array.filter(key => value.startsWith(key)); }
