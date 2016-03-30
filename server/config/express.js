/**
* Express Server Configuration
*/
var express    = require('express'),
    compress   = require('compression'),
    bodyParser = require('body-parser'),
    session    = require('express-session'),
    FileStore  = require('session-file-store')(session),
    morgan     = require('morgan'),
    fs         = require('fs'),
    winston    = require('winston');

var codes = require('../config/codes');
var interceptors = require('../config/interceptors');

// Accept generic express instances (initialised in app.js)
exports.configure = function configure(app) {
  'use strict';

  winston.log('debug', 'Configuring middleware');

  // middleware
  app.use(compress());
  app.use(bodyParser.json({ limit : '8mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));

  // stores session in a file store so that server restarts do
  // not interrupt sessions.
  app.use(session({
    store             : new FileStore({
      reapInterval      : Number(process.env.SESS_REAP_INTERVAL),
      logFn             : () => {}
    }),
    secret            : process.env.SESS_SECRET,
    saveUninitialized : Boolean(process.env.SESS_SAVE_UNINITIALIZED),
    resave            : Boolean(process.env.SESS_RESAVE),
    unset             : process.env.SESS_UNSET,
    cookie            : { secure : true },
    retries: 50
  }));

  // bind error codes to the express stack
  // this allows you to later throw errors via the
  // call req.codes.ERR_NOT_FOUND, etc..
  app.use(function (req, res, next) {
    req.codes = codes;
    next();
  });

  // reject PUTs and POSTs with empty objects in the data property with a 400
  // error
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

  // provide a stream for morgan to write to 
  winston.stream = {
    write : function (message, encoding) {
      winston.info(message.trim());
    }
  };

  // morgan logger setup
  // options: combined | common | dev | short | tiny
  app.use(morgan('combined', { stream : winston.stream }));


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
      winston.log('debug', 'Rejecting unauthorized acces to %s from %s', req.path, req.ip);
      next(new req.codes.ERR_NOT_AUTHENTICATED());
    } else {
      next();
    }
  });
};

/** configures error handlers */
exports.errorHandling = function errorHandling(app) {
  'use strict';

  app.use(interceptors.newErrorHandler);
  app.use(interceptors.apiErrorHandler);
  app.use(interceptors.databaseErrorHandler);
  app.use(interceptors.catchAllErrorHandler);
};
