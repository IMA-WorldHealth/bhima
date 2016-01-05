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

var cfg   = require('../config/environment/' + process.env.NODE_ENV);
var codes = require('../config/codes');

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
      reapInterval      : cfg.session.reapInterval,
    }),
    secret            : cfg.session.secret,
    saveUninitialized : cfg.session.saveUninitialized,
    resave            : cfg.session.resave,
    unset             : 'destroy',
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
      next(req.codes.ERR_EMPTY_BODY);
    } else {
      next();
    }
  });

  // morgan logger setup
  // options: combined | common | dev | short | tiny
  // Recommend 'combined' for production settings.
  //
  // Uncomment if you want logs written to a file instead
  // of piped to standard out (default).
  //var logFile = fs.createWriteStream(__dirname + '/access.log', {flags : 'a'});
  //app.use(morgan('short', { stream : logFile }));

  // custom logLevel 'none' allows developers to turn off logging during tests
  if (cfg.logLevel !== 'none') {
    app.use(morgan(cfg.logLevel));
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
      next('ERR_NOT_AUTHENTICATED');
    } else {
      next();
    }
  });
};

exports.errorHandling = function errorHandling(app) {
  'use strict';

  // TODO Is there a open source middleware that does this?
  function interceptDatabaseErrors(err, req, res, next) {
    var codes = [{
        code : 'ER_BAD_FIELD_ERROR',
        httpStatus : 400,
        reason : 'Column does not exist in database.'
      }, {
        code : 'ER_ROW_IS_REFERENCED_2',
        httpStatus : 400,
        reason : 'Cannot delete entity becuase entity is used in another table.'
      }
    ];

    var supported = codeSupported(codes, err);
    if (supported) {

      // NOTE -- we prefix errors with "DB." for proper client
      // translation.
      // TODO -- review this decision
      return res.status(supported.httpStatus).json({
        code : 'DB.' + supported.code,
        reason : supported.reason,
        raw : err
      });
    } else {

      // Unkown code - forward error
      next(err);
    }
  }

  function catchAll(err, req, res, next) {
    console.log('[ERROR]', err);
    res.status(500).json(err);
    return;
  }

  // TODO Research methods effeciency and refactor
  function codeSupported(codes, err) {
    var result = null;

    codes.some(function (supported) {
      if (supported.code === err.code) {
        result = supported;
        return true;
      }
    });
    return result;
  }

  function interceptThrownErrors(err, req, res, next) {

    // check if it is a throw error
    if (err.httpStatus) {
      res.status(err.httpStatus).json(err);
    } else if (typeof err === 'string') {
      var error = codes[err];
      res.status(error.httpStatus).json(error);
    } else {
      next(err);
    }
  }

  app.use(interceptThrownErrors);
  app.use(interceptDatabaseErrors);
  app.use(catchAll);
};
