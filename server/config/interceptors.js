/**
 * @module config/errorHandlers
 *
 * @description This modules defines serveral different error handlers for the bhima
 * application.  Errors generally fall into three categories:
 *  1. Database Errors
 *  2. Application/API Errors
 *  3. Unexpected Errors
 *
 * Each error handler is responsible for logging the errors to a log file and returning
 * an appropriate error code (for translation) to the client.
 *
 * @todo Import logging functionality into this module.
 *
 * @requires config/codes
 * @requires lib/errors/Forbidden
 * @requires lib/errors/Unauthorized
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 * @requires lib/errors/NotFound
 * @requires lib/errors/InternalServerError
 
 * @requires lib/errors/ProtectedField
 * @requires lib/errors/NegativeValue
 * @requires lib/errors/EmptyBody
 * @requires lib/errors/BadValue
 * @requires lib/errors/ParametersRequired
 */

var errors = require('./codes');
var winston = require('winston');

var BadRequest          = require('../lib/errors/BadRequest');
var Unauthorized        = require('../lib/errors/Unauthorized');
var Forbidden           = require('../lib/errors/Forbidden');
var NotFound            = require('../lib/errors/NotFound');
var InternalServerError = require('../lib/errors/InternalServerError');

/**
 * This function identifies whether a parameter is a native error of JS or not.
 *
 * @param {Error} error
 * @returns {boolean} bool - true if the error is a native error, false otherwise
 */
function isNativeError(error) {
  return (
    error instanceof TypeError ||
    error instanceof RangeError ||
    error instanceof EvalError ||
    error instanceof URIError ||
    error instanceof EvalError
  );
}

/**
 * This function identifies whether an error is an error constructed by the API
 * as defined in lib/errors/*.js.
 *
 * @param {Error} error
 * @returns {boolean} bool - true if the error is an API error, false otherwise
 */
function isApiError(error) {
  return (
    error instanceof NotFound ||
    error instanceof Unauthorized ||
    error instanceof Forbidden ||
    error instanceof BadRequest ||
    error instanceof InternalServerError
	);
}

/**
 * This error handler exists while we are migrating to the new error imports and
 * deprecating req.codes.  It should eventually replace all API error handling.
 * A catchall error handler will still be necessary.
 */
exports.newErrorHandler = function newErrorHandler(error, req, res, next) {

  // skip this middleware if not an API error
  if (!isApiError(error)) { return next(error); }

  // send to the client with the appropriate status code
  res.status(error.status).json(error);
};


/**
 * Handles errors specifically generated by the application API.
 */
exports.apiErrorHandler = function apiErrorHandler(error, req, res, next) {
  'use strict';

  // skip native errors - caught in catchAll
  if (isNativeError(error)) { return next(error); }

  // check to see if this is an API error
  if (error && error.httpStatus) {

    winston.debug('[ERROR]', error);

    // remove the status from the error;
    var status = error.httpStatus;
    delete error.httpStatus;

    // return to the client as a JSON object error.
    res.status(status).json(error);

  // if not matching an API error, pass along to the next interceptor
  } else {
    next(error);
  }
};


/**
 * Handles errors specifically generated by MySQL.
 */
exports.databaseErrorHandler = function databaseErrorHandler(error, req, res, next) {
  'use strict';

  // skip native errors - caught in catchAllErrorHandler
  if (isNativeError(error)) { return next(error); }

  // check to see if this is a database error
  if (error && error.sqlState) {

    winston.debug('[ERROR]', error);

    // retrieve the formatted error from
    try {
      var appError = new errors[error.code]();

      var status = appError.httpStatus;
      delete appError.httpStatus;

      // send the formatted error back to the client.
      res.status(status).json(appError);

    // if no matching error found, pass on to next();
    } catch (e)  {
      next(error);
    }

  // if not matching a databse error, forward to next interceptor
  } else {
    next(error);
  }
};



/**
 * Handles errors not caught by the previous error handlers.  These are often
 * unanticipated errors passed to next(), not ones emitted as an uncaught exception event.
 */
exports.catchAllErrorHandler = function catchAllErrorHandler(error, req, res, next) {
  'use strict';

  winston.error('[ERROR]', error);

  // return a 500 error so the client
  res.status(500).json(error);
};

