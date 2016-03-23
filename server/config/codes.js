/**
* @module config/codes
*
* @desc These codes are to be attached to the res object, and used to throw errors
* within the application.  The basic usage should be either:
*
* @example
* next(new res.codes.ERR_NOT_FOUND());
* Promise.then(function () { throw new res.codes.ERR_NOT_FOUND(); }).catch(next);
*
* @deprecated This module should not longer be used.  See issue #182.
*/

/** custom errorFactory function to throw in API endpoints */
function makeError(name, defn) {

  // must call 'new' on this function
  function AppError() {
    this.name = name;

    // these should never be blank.
    this.message = (defn.reason || '');
    this.reason = (defn.reason || '');
    this.code = (defn.code || 'ERR_UNKNOWN_ERROR');
    this.httpStatus = defn.httpStatus;

    // record the callstack where and when it was thrown
    /** @todo -- make this work */
    this.stack = (new Error()).stack;
  }

  // ensure that we are inheriting from the global error object
  AppError.prototype = Object.create(Error.prototype);
  AppError.prototype.constructor = AppError;

  return AppError;
}

/** @deprecated See issue #182 */
module.exports = {

  /** application error codes */
  'ERR_NOT_FOUND' : makeError('ApiError', {
    code : 'ERR_NOT_FOUND',
    httpStatus : 404,
    reason : 'We could not find a record by that id.'
  }),
  'ERR_NOT_AUTHENTICATED' : makeError('ApiError', {
    code : 'ERR_NOT_AUTHENTICATED',
    httpStatus : 401,
    reason : 'You have not yet authenticated with the API to access the endpoint.  Send a POST to /login with proper credentials to sign in.'
  }),
  'ERR_NO_PERMISSIONS' : makeError('ApiError', {
    code : 'ERR_NO_PERMISSIONS',
    httpStatus : 301,
    reason : 'You do not have permissions to access the endpoint.'
  }),
  'ERR_BAD_CREDENTIALS' : makeError('ApiError', {
    code : 'ERR_BAD_CREDENTIALS',
    httpStatus : 401,
    reason : 'You did not provide the correct credentials to access the endpoint.'
  }),
  'ERR_NO_ENTERPRISE' : makeError('ApiError', {
    code : 'ERR_NO_ENTERPRISE',
    httpStatus : 401,
    reason : 'There are no enterprises regiested in the database. Please contact a developer.'
  }),
  'ERR_NO_PROJECT' : makeError('ApiError', {
    code : 'ERR_NO_PROJECT',
    httpStatus : 401,
    reason : 'There are no projects registered in the database.  The selected action cannot be completed.'
  }),
  'ERR_EMPTY_BODY' : makeError('ApiError', {
    code : 'ERR_EMPTY_BODY',
    httpStatus : 400,
    reason : 'You cannot submit a PUT/POST request with an empty body to the server.'
  }),
  'ERR_PROTECTED_FIELD' : makeError('ApiError', {
    code: 'ERR_PROTECTED_FIELD',
    httpStatus : 400,
    reason : 'The update request attempted to change a protected field.'
  }),
  'ERR_PARAMETERS_REQUIRED' : makeError('ApiError', {
    code : 'ERR_PARAMETERS_REQUIRED',
    httpStatus : 400,
    reason : 'The request requires at least one parameter.'
  }),
  'ERR_NEGATIVE_VALUES' : makeError('ApiError', {
    code : 'ERR_NEGATIVE_VALUES',
    httpStatus : 400,
    reason : 'Expected some value(s) to be positive, but received a negative value.'
  }),
 'ERR_BAD_VALUE' : makeError('ApiError', {
   code : 'ERR_BAD_VALUE',
   httpStatus : 400,
   reason : 'You sent a bad value for some parameters'
 }),
 'ERR_MISSING_REQUIRED_PARAMETERS' : makeError('ApiError', {
   code : 'ERR_MISSING_REQUIRED_PARAMETERS',
   httpStatus : 400,
   reason : 'The request requires some essentials parameters which are missing'
 }),
 'ERR_RESOURCE_NOT_FOUND' : makeError('ApiError', {
   code : 'ERR_RESOURCE_NOT_FOUND',
   httpStatus : 500,
   reason : 'The necessary resource is not found'
 }),
 'ERR_EXCHANGE_RATE_NOT_FOUND' : makeError('ApiError', {
   code : 'ERR_EXCHANGE_RATE_NOT_FOUND',
   httpStatus : 500,
   reason : 'There is no exchange rate defined for the current date or for a given date'
 }),
 'ERR_DATE_NOT_DEFINED' : makeError('ApiError', {
   code : 'ERR_DATE_NOT_DEFINED',
   httpStatus : 400,
   reason : 'The date for an operation is not defined in the request'
 }),

  /** MySQL error codes */
  'ER_DISK_FULL' : makeError('DatabaseError', {
    code : 'DB.ER_DISK_FULL',
    httpStatus : 500,
    reason : 'The databsae ran out of space.  Please free some memory to continue using the application.'
  }),
  'ER_DUP_KEY' : makeError('DatabaseError', {
    code : 'DB.ER_DUP_KEY',
    httpStatus: 400,
    reason : 'A key collided in a unique database field.  Please either retry your action.  If the problem persists, contact the developers.'
  }),
  'ER_BAD_FIELD_ERROR' : makeError('DatabaseError', {
    code : 'DB.ER_BAD_FIELD_ERROR',
    httpStatus : 400,
    reason : 'Column does not exist in database.'
  }),
  'ER_ROW_IS_REFERENCED_2' : makeError('DatabaseError', {
    code : 'DB.ER_ROW_IS_REFERENCED_2',
    httpStatus : 400,
    reason : 'Cannot delete entity becuase entity is used in another table.'
  }),
  'ER_BAD_NULL_ERROR'  : makeError('DatabaseError', {
    code : 'DB.ER_BAD_NULL_ERROR',
    httpStatus: 400,
    reason : 'A column was left NULL that cannot be NULL.'
  }),
  'ER_DUP_ENTRY' : makeError('DatabaseError', {
    code : 'DB.ER_DUP_ENTRY',
    httpStatus: 400,
    reason : 'You cannot insert a duplicate record.  This record already exists.'
  }),
  'ER_PARSE_ERROR' : makeError('DatabaseError', {
    code : 'DB.ER_PARSE_ERROR',
    httpStatus : 400,
    reason : 'Your query cannot be translated into valid SQL.  Please modify your query and try again.'
  }),
  'ER_EMPTY_QUERY' :  makeError('DatabaseError', {
    code : 'DB.ER_EMPTY_QUERY',
    httpStatus : 400,
    reason : 'The query was empty.'
  }),
  'ER_NO_DEFAULT_FOR_FIELD' : makeError('DatabaseError', {
    code : 'DB.ER_NO_DEFAULT_FOR_FIELD',
    httpStatus : 400,
    reason : 'You did not include enough information in your query.'
  }),
};
