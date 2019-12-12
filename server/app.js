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
 * @requires http
 * @requires dotenv
 * @requires express
 * @requires debug
 *
 * @requires config/express
 * @requires config/routes
 *
 * @license GPL-2.0
 * @copyright IMA World Health 2016
 */

require('use-strict');
const dotEnv = require('dotenv');

configureEnvironmentVariables();

const http = require('http');
const express = require('express');
const debug = require('debug')('app');

const app = express();

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
  const env = process.env.NODE_ENV.toLowerCase();

  // decode the file path for the environmental variables.
  const dotfile = `server/.env.${env}`.trim();

  // load the environmental variables into process using the dotenv module
  dotEnv.config({ path : dotfile });
}

/**
 * @function configureServer
 *
 * @description
 * Set up the HTTP server to listen on the correct
 */
function configureServer() {
  // destruct the environmental variables
  const port = process.env.PORT;
  const mode = process.env.NODE_ENV;

  // create the server
  http.createServer(app)
    .listen(process.env.PORT, () => {
      debug(`configureServer(): Server started in mode ${mode} on port ${port}.`);
    });
}

// run configuration tools
configureServer();

// Configure application middleware stack, inject authentication session
require('./config/express').configure(app);

// Link routes
require('./config/routes').configure(app);

// link error handling
require('./config/express').errorHandling(app);

// ensure the process terminates gracefully when an error occurs.
process.on('uncaughtException', (e) => {
  debug('process.onUncaughException: %o', e);
  /**
   * TODO(@jniles) - crash the server on uncaught exceptions.  At the moment, we cannot
   * do this because of a longstanding bug in wkhtmltopdf that prevents us from catching
   * errors does to broken src="" links.  It occurs if the enterprise logo is destroyed.
   * SEE: https://github.com/wkhtmltopdf/wkhtmltopdf/issues/2051
   */
  // process.exit(1);
});

// crash on unhandled promise rejections
process.on('unhandledRejection', (e) => {
  debug('process.onUnhandledRejection: %o', e);
  process.exit(1);
});

process.on('warning', (warning) => {
  debug('process.onWarning: %o', warning);
});
