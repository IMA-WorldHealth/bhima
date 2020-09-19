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

import 'use-strict';
import dotEnv from 'dotenv';

dotEnv.config();

import http from 'http';
import express from 'express';
import dbg from 'debug';

const debug = dbg('app');

const app = express();

/**
 * @function configureServer
 *
 * @description
 * Set up the HTTP server to listen on the correct
 */
function configureServer() {
  // destruct the environmental variables
  const port:string = process.env.PORT || '8080';
  const mode:string = process.env.NODE_ENV || 'production';

  // create the server
  http.createServer(app)
    .listen(port, () => {
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
  process.exit(1);
});

// crash on unhandled promise rejections
process.on('unhandledRejection', (e) => {
  debug('process.onUnhandledRejection: %o', e);
  process.exit(1);
});

process.on('warning', (warning) => {
  debug('process.onWarning: %o', warning);
});

module.exports = app;
