var util = require('util');

/**
 * This implements an HTTP error code that should eventually be passed through
 * next() to an error handling middleware.
 *
 * @param {String} description - a custom description to be sent to the client
 *
 * @example
 * // import the error into a controller
 * const Unauthorized = require('lib/errors/Unauthorized');
 *
 * // use the error in either a promise chain or directly pass to next()
 * return next(new Unauthorized('Some description...'));
 *
 * @constructor
 */
function Unauthorized(description) {
  'use strict';

  // make sure we have a working stack trace
  Error.captureStackTrace(this, this.constructor);

  // HTTP status code
  this.status = 401;

  // bhima status code (for $translation)
  this.code = 'ERRORS.UNAUTHORIZED';

  // default to an empty string if no description passed in
  this.description = description || '';
}

// prototypically inherit from the global error object
util.inherits(Unauthorized, Error);

// expose the function to an external controller
module.exports = Unauthorized;
