var express = require('express'),
    https   = require('https'),
    winston = require('winston'),
    fs      = require('fs');

function loadEnvironmentalVariables() {

  // warn the user if the process does not have a NODE_ENV variable configured
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  // normalize the environmental variable name
  var env = process.env.NODE_ENV.toLowerCase();

  // decode the file path for the environmental variables.
  var fPath = 'server/.env.{env}'.replace('{env}', env);

  // load the environmnetal variables into process using the dotenv module
  console.log('[app] Loading configuration from file: %s', fPath);
  require('dotenv').config({ path : fPath.toString().trim() });
}

function configureLogger() {
  var logFile = process.env.LOG_FILE;

  // allow logging to a file if needed
  if (logFile) {
    winston.add(winston.transports.File, { filename : logFile });
  }

  // set logging levels to that found in the file
  winston.level = process.env.LOG_LEVEL;

  // make sure to log unhandled exceptions
  winston.handleExceptions(winston.transports.Console);
}

loadEnvironmentalVariables();

configureLogger();

// SSL credentials
var privateKey  = fs.readFileSync(process.env.TLS_KEY, 'utf8');
var certificate = fs.readFileSync(process.env.TLS_CERT, 'utf8');
var credentials = { key : privateKey, cert : certificate };

// configure the database for use within the application
require('./lib/db').initialise();

var app = express();

// Configure application middleware stack, inject authentication session
require('./config/express').configure(app);

// Link routes
require('./config/routes').configure(app);

// link error hanlding
require('./config/express').errorHandling(app);

// Load and configure plugins
// TODO - find a better way to load in a list of plugins
require('./lib/pluginManager')(app, []);

// start the server
https.createServer(credentials, app)
  .listen(process.env.PORT, logApplicationStart);

process.on('uncaughtException', handleUncaughtExceptions);

function logApplicationStart() {
  winston.log('info', 'BHIMA server started in mode %s on port %s.', process.env.NODE_ENV.toLowerCase(), process.env.PORT);
}

function handleUncaughtExceptions(err) {
  process.exit(1);
}
