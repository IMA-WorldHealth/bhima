/**
 * @overview
 * The application's middleware configuration.
 *
 * @todo - this could probably be separated by functionality.
 */
const express    = require('express');
const compress   = require('compression');
const bodyParser = require('body-parser');
const session    = require('express-session');
const RedisStore = require('connect-redis')(session);
const morgan     = require('morgan');
const fs         = require('fs');
const winston    = require('winston');
const _          = require('lodash');
const helmet     = require('helmet');
const path       = require('path');
const Redis      = require('ioredis');

const interceptors = require('./interceptors');
const Unauthorized = require('../lib/errors/Unauthorized');
const uploads      = require('../lib/uploader');

// accept generic express instances (initialised in app.js)
exports.configure = function configure(app) {
  'use strict';

  winston.debug('Configuring middleware.');

  app.use(compress());

  // helmet guards
  app.use(helmet());

  app.use(bodyParser.json({ limit : '8mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));

  // stores session in a file store so that server restarts do not interrupt
  // client sessions.
  app.use(session({
    store: new RedisStore({client: new Redis() }),
    secret: process.env.SESS_SECRET,
    resave: Boolean(process.env.SESS_RESAVE),
    saveUninitialized: Boolean(process.env.SESS_UNINITIALIZED),
    unset: process.env.SESS_UNSET,
    cookie: { secure : true },
    retries: 50
  }));

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
  app.use(express.static('client/', { maxAge : 7*days }));
  app.use(`/${uploads.directory}`, express.static(uploads.directory));

  // quick way to find out if a value is in an array
  function within(value, array) { return array.indexOf(value.trim()) !== -1; }

  // Only allow routes to use /login, /projects, /logout, and /languages if a
  // user session does not exists
  let publicRoutes = ['/login', '/languages', '/projects/', '/logout'];

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
