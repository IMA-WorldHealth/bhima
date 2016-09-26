/**
 * @overview server
 * Basic Hospital Information Management Application
 *
 * This is the central server of bhima.  It is responsible for setting up the
 * HTTP server, logging infrastructure, and environmental variables.  These are
 * global throughout the application, and are configured here.
 *
 * The application routes are configured in {@link server/config/routes}, while
 * the middleware is configured in {@link server/config/express}.
 *
 * @requires fs
 * @requires https
 * @requires dotenv
 * @requires express
 * @requires winston
 *
 * @requires config/express
 * @requires config/routes
 * @requires PluginManager
 *
 * @license GPL-2.0
 * @copyright IMA World Health 2016
 */

'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const winston = require('winston');

let app = express();

/**
 * @function configureEnvironmentVariables
 *
 * @description
 * Uses dotenv to add environmental variables from the .env.* file to the
 * process object.  If the NODE_ENV system variable is not set, the function
 * defaults to 'production'
 */
function configureEnvironmentVariables() {

  // if the process NODE_ENV is not set, default to production.
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  // normalize the environmental variable name
  let env = process.env.NODE_ENV.toLowerCase();

  // decode the file path for the environmental variables.
  let dotfile = `server/.env.${env}`.trim();

  // load the environmnetal variables into process using the dotenv module
  console.log(`[app] Loading configuration from ${dotfile}.`);
  require('dotenv').config({ path : dotfile });
}

/**
 * @function configureLogger
 *
 * @description
 * Harnesses winston to log both events uniformly across the server.  This
 * includes HTTP requests (using morgan), application events, and plugin events.
 *
 * By default, the only configured logging interface is the console.  This
 * should not be the case in production.  If the LOG_FILE environmental
 * variable exists, the server will use it write all logs.
 *
 */
function configureLogger() {

  // set logging levels to that found in the configuration file (default: warn)
  winston.level = process.env.LOG_LEVEL || 'warn';

  let logFile = process.env.LOG_FILE;

  // allow logging to a file if needed
  if (logFile) {
    winston.add(winston.transports.File, { filename : logFile });
  }

  // be sure to log unhandled exceptions
  winston.handleExceptions(new winston.transports.Console({
    humanReadableUnhandledException: true,
    colorize: true,
    prettyPrint: true
  }));
}

/**
 * @function configureServer
 *
 * @description
 * Set up the HTTPS server by loading the correct SSL configuration from the
 * file system and listening on the required port.
 */
function configureServer() {

  // credentials
  const key = fs.readFileSync(process.env.TLS_KEY, 'utf8');
  const cert = fs.readFileSync(process.env.TLS_CERT, 'utf8');
  const credentials = { key : key , cert : cert };

  // destruct the environmental variables
  const port = process.env.PORT;
  const mode = process.env.NODE_ENV;

  // create the server
  https.createServer(credentials, app)
    .listen(process.env.PORT, () => {
      winston.info(`Server started in mode ${mode} on port ${port}.`);
    });

}

// run configuration tools
configureEnvironmentVariables();
configureLogger();
configureServer();

// Configure application middleware stack, inject authentication session
require('./config/express').configure(app);

// Link routes
require('./config/routes').configure(app);

// link error handling
require('./config/express').errorHandling(app);

// Load and configure plugins
// @todo - find a better way to load in a list of plugins
require('./lib/PluginManager')(app, []);

// ensure the process terminates gracefully when an error occurs.
process.on('uncaughtException', (exception) => {
  winston.error(exception);
  process.exit(1);
});

process.on('warning', (warning) => {
  winston.warn(warning.message);
  winston.warn(warning.stack);
});
