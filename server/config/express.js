/**
 * @overview
 * The application's middleware configuration.
 *
 * @todo - this could probably be separated by functionality.
 */
'use strict';

const express    = require('express');
const compress   = require('compression');
const bodyParser = require('body-parser');
const session    = require('express-session');
const RedisStore = require('connect-redis')(session);
const Redis      = require('ioredis');
const morgan     = require('morgan');
const fs         = require('fs');
const winston    = require('winston');
const _          = require('lodash');
const helmet     = require('helmet');
const path       = require('path');

const interceptors = require('./interceptors');
const Unauthorized = require('../lib/errors/Unauthorized');
const uploads      = require('../lib/uploader');

// accept generic express instances (initialised in app.js)
exports.configure = function configure(app) {
  // TODO - things don't work well yet.
  //const isProduction = (process.env.NODE_ENV === 'production');
  const isProduction = false;

  winston.debug('Configuring middleware.');

  // helmet guards
  app.use(helmet());
  app.use(compress());

  app.use(bodyParser.json({ limit : '8mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));

  // this will disable the session from expiring on the server (redis-session)
  // during development
  const disableTTL = !isProduction;

  // stores session in a file store so that server restarts do not interrupt
  // client sessions.
  const sess = {
    store: new RedisStore({
      client: new Redis(),
      disableTTL: disableTTL
    }),
    secret: process.env.SESS_SECRET,
    resave: Boolean(process.env.SESS_RESAVE),
    saveUninitialized: Boolean(process.env.SESS_UNINITIALIZED),
    unset: process.env.SESS_UNSET,
    cookie: { httpOnly : true },
    retries: 20
  };

  // indicate that we are running behind a trust proxy and should use a secure cookie
  if (isProduction) {
    app.set('trust proxy', true);
    sess.cookie.secure = true;
  }

  // bind the session to the middleware
  app.use(session(sess));

  // provide a stream for morgan to write to
  winston.stream = {
    write : message => winston.info(message.trim())
  };

  // http logger setup
  // options: combined | common | dev | short | tiny
  app.use(morgan('combined', { stream : winston.stream }));

  // public static directories include the entire client and the uploads
  // directory.
  const days = 1000 * 60 * 60 * 24;
  const params = {};
  params.maxAge = isProduction ? 7*days : 0;
  app.use(express.static('client/', params));
  app.use(`/${uploads.directory}`, express.static(uploads.directory));

  // quick way to find out if a value is in an array
  function within(value, array) { return array.indexOf(value.trim()) !== -1; }

  // Only allow routes to use /login, /projects, /logout, and /languages if a
  // user session does not exists
  let publicRoutes = ['/auth/login', '/languages', '/projects/', '/auth/logout'];

  app.use(function (req, res, next) {
    if (_.isUndefined(req.session.user) && !within(req.path, publicRoutes)) {
      winston.debug(`Rejecting unauthorized access to ${req.path} from ${req.ip}`);
      next(new Unauthorized('You are not logged into the system.'));
    } else {
      next();
    }
  });
};

// configures error handlers
exports.errorHandling = function errorHandling(app) {
  app.use(interceptors.handler);
};
