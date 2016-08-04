/**
 * @overview interceptors
 * This modules defines a unified error handler for the server.
 * Each controller is expected to define specific errors that are uniformly
 * sent to the client using the using the error functions found in `lib/errors/`.
 *
 * The only unexpected errors are database errors, uniformly treated as
 * BadRequests (HTTP stats code 400).
 *
 * @requires winston
 * @requires BadRequest
 */
const winston = require('winston');
const BadRequest = require('../lib/errors/BadRequest');

// map MySQL error codes to HTTP status codes
const map = {
  ER_DUP_KEY :
    `A key collided in a unique database field.  Please retry your action.  If
    the problem persists, contact the developers.`,
  ER_BAD_FIELD_ERROR : 'Column does not exist in database.',
  ER_ROW_IS_REFERENCED_2 :
    'Cannot delete entity because entity is used in another table.',
  ER_BAD_NULL_ERROR : 'A column was left NULL that cannot be NULL.',
  ER_DUP_ENTRY :
    'You cannot insert a duplicate record.  This record already exists.',
  ER_PARSE_ERROR :
    `Your request could not  be translated into valid SQL.  Please modify your
    request and try again.`,
  ER_EMPTY_QUERY : 'Your request had an empty body.',
  ER_NO_DEFAULT_FOR_FIELD :
    'You did not include enough information in your query.',
  ER_DATA_TOO_LONG :
    'The value provided is longer than the database record limit.'
};

/**
 * Server Error Handler
 *
 * This error handler interprets all errors and sends them to the client.
 */
exports.handler = function handler(error, req, res, next) {

  // log the error to the error log (NOTE: in production, this should be 'error')
  winston.log('debug', error);

  // check if it is a database error and format the proper description if so.
  if (error.sqlState) {
    console.log('error:', error);
    error = new BadRequest(map[error.code]);
  }

  // prevent invalid http error codes.
  if (!error.status) { error.status = 500; }

  // send to the client with the appropriate status code
  res.status(error.status).json(error);
};
