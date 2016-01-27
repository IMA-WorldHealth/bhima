/**
* Express Server Configuration
*/
var express    = require('express'),
    compress   = require('compression'),
    bodyParser = require('body-parser'),
    session    = require('express-session'),
    FileStore  = require('session-file-store')(session),
    morgan     = require('morgan'),
    fs         = require('fs');

var codes = require('../config/codes');
var interceptors = require('../config/interceptors');

// Accept generic express instances (initialised in app.js)
exports.configure = function configure(app) {
  'use strict';

  console.log('[config/express] Configure express');

  // middleware
  app.use(compress());
  app.use(bodyParser.json({ limit : '8mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));

  // stores session in a file store so that server restarts do
  // not interrupt sessions.
  app.use(session({
    store             : new FileStore({
      reapInterval      : Number(process.env.SESS_REAP_INTERVAL),
    }),
    secret            : process.env.SESS_SECRET,
    saveUninitialized : Boolean(process.env.SESS_SAVE_UNINITIALIZED),
    resave            : Boolean(process.env.SESS_RESAVE),
    unset             : process.env.SESS_UNSET,
    cookie            : { secure : true }
  }));

  // bind error codes to the express stack
  // this allows you to later throw errors via the
  // call req.codes.ERR_NOT_FOUND, etc..
  app.use(function (req, res, next) {
    req.codes = codes;
    next();
  });

  // NOTE -- EXPERIMENTAL
  // reject PUTs and POSTs with empty objects in the data
  // property with a 400 error
  app.use(function (req, res, next) {
    if (req.method !== 'PUT' && req.method !== 'POST') {
      return next();
    }

    // make sure the body object contains something
    var emptyBody = Object.keys(req.body).length === 0;

    if (emptyBody) {
      next(new req.codes.ERR_EMPTY_BODY());
    } else {
      next();
    }
  });

  // morgan logger setup
  // options: combined | common | dev | short | tiny
  // Recommend 'combined' for production settings.

  // if a LOG_FILE is specified, write the output to that logfile
  if (process.env.LOG_FILE) {
    var file = fs.createWriteStream(process.env.LOG_FILE, { flags : 'a'});

    // custom log level 'none' suppresses all output during local tests
    if (process.env.LOG_LEVEL !== 'none') {
      app.use(morgan(process.env.LOG_LEVEL, { stream : file }));
    }
  }


  // serve static files from a single location
  // NOTE the assumption is that this entire directory is public -
  // there is no need to authenticate users to access the public
  // directory.
  var days = 1000 * 60 * 60 * 24;
  app.use(express.static('client/', { maxAge : 7*days }));

  // quick way to find out if a value is in an array
  function within(value, array) { return array.indexOf(value) !== -1; }

  // Only allow routes to use /login, /projects, /logout, and /language if session does not exists
  app.use(function (req, res, next) {

    var publicRoutes = ['/login', '/languages', '/projects', '/logout'];

    if (req.session.user === undefined && !within(req.path, publicRoutes)) {
      next(new req.codes.ERR_NOT_AUTHENTICATED());
    } else {
      next();
    }
  });
};

/** configures error handlers */
exports.errorHandling = function errorHandling(app) {
  'use strict';

  app.use(interceptors.apiErrorHandler);
  app.use(interceptors.databaseErrorHandler);
  app.use(interceptors.catchAllErrorHandler);
};
