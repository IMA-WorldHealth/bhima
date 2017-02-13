const util = require('util');

/**
 * @class NoProject
 *
 * @description
 * A custom error to wrap the 401 HTTP status code within the server.  This
 * should only be thrown in a context where it can be caught by ExpressJS's
 * {@link http://expressjs.com/en/guide/routing.html|next()} function and
 * returned to the client.
 *
 * @param {String} description - a custom description to be sent to the client
 *
 * @example
 * // import the error into a controller
 * const NoProject = require('lib/errors/NoProject');
 *
 * // use by directly throwing ...
 * throw new NoProject('No permissions for that project!');
 *
 * // or by calling next in the server context
 * next(new NoProject('Some description...'));
 *
 * // or by combining both in a promise chain!
 * Promise.then(() => {
 *   throw new NoProject('This will be caught in Promise.catch()');
 * })
 * .catch(next);
 *
 * @requires util
 */
function NoProject(description) {
  'use strict';

  // make sure we have a working stack trace
  Error.captureStackTrace(this, this.constructor);

  // HTTP status code
  this.status = 401;

  // bhima status code (for $translation)
  this.code = 'ERRORS.NO_PROJECT';

  // default to an empty string if no description passed in
  this.description = description || '';
}

// prototypically inherit from the global error object
util.inherits(NoProject, Error);

// expose the function to an external controller
module.exports = NoProject;
