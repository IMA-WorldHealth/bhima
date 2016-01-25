/**
* @module config/codes
*
* @desc These codes are to be attached to the res object, and used to throw errors
* within the application.  The basic usage should be either:
*
* @example
* next(Error(res.codes.ERR_NOT_FOUND));
* Promise.then(function () { throw new Error(res.codes.ERR_NOT_FOUND); }).catch(next);
*/

module.exports = {

  /** application error codes */
  'ERR_NOT_FOUND' : {
    code : 'ERR_NOT_FOUND',
    httpStatus : 404,
    reason : 'We could not find a record by that id.'
  },
  'ERR_NOT_AUTHENTICATED' : {
    code : 'ERR_NOT_AUTHENTICATED',
    httpStatus : 401,
    reason : 'You have not yet authenticated with the API to access the endpoint.  Send a POST to /login with proper credentials to sign in.'
  },
  'ERR_NO_PERMISSIONS' : {
    code : 'ERR_NO_PERMISSIONS',
    httpStatus : 301,
    reason : 'You do not have permissions to access the endpoint.'
  },
  'ERR_BAD_CREDENTIALS' : {
    code : 'ERR_BAD_CREDENTIALS',
    httpStatus : 401,
    reason : 'You did not provide the correct credentials to access the endpoint.'
  },
  'ERR_NO_ENTERPRISE' : {
    code : 'ERR_NO_ENTERPRISE',
    httpStatus : 401,
    reason : 'There are no enterprises regiested in the database. Please contact a developer.'
  },
  'ERR_NO_PROJECT' : {
    code : 'ERR_NO_PROJECT',
    httpStatus : 401,
    reason : 'There are no projects registered in the database.  The selected action cannot be completed.'
  },
  'ERR_EMPTY_BODY' : {
    code : 'ERR_EMPTY_BODY',
    httpStatus : 400,
    reason : 'You cannot submit a PUT/POST request with an empty body to the server.'
  },
  'ERR_PROTECTED_FIELD' : {
    code: 'ERR_PROTECTED_FIELD',
    httpStatus : 400,
    reason : 'The update request attempted to change a protected field.'
  },
  'ERR_PARAMETERS_REQUIRED' : {
    code : 'ERR_PARAMETERS_REQUIRED',
    httpStatus : 400,
    reason : 'The request requires at least one parameter.'
  },
  'ERR_NEGATIVE_VALUES' : {
    code : 'ERR_NEGATIVE_VALUES',
    httpStatus : 400,
    reason : 'Expected some value(s) to be positive, but received a negative value.'
  },
 'ERR_BAD_VALUE' : {
   code : 'ERR_BAD_VALUE',
   httpStatus : 400,
   reason : 'You sent a bad value for some parameters'
 },

  /** MySQL error codes */
  'ER_DISK_FULL' : {
    code : 'DB.ER_DISK_FULL',
    httpStatus : 500,
    reason : 'The databsae ran out of space.  Please free some memory to continue using the application.'
  },
  'ER_DUP_KEY' : {
    code : 'DB.ER_DUP_KEY',
    httpStatus: 400,
    reason : 'A key collided in a unique database field.  Please either retry your action.  If the problem persists, contact the developers.'
  },
  'ER_BAD_FIELD_ERROR' : {
    code : 'DB.ER_BAD_FIELD_ERROR',
    httpStatus : 400,
    reason : 'Column does not exist in database.'
  },
  'ER_ROW_IS_REFERENCED_2' : {
    code : 'DB.ER_ROW_IS_REFERENCED_2',
    httpStatus : 400,
    reason : 'Cannot delete entity becuase entity is used in another table.'
  },
  'ER_BAD_NULL_ERROR'  : {
    code : 'DB.ER_BAD_NULL_ERROR',
    httpStatus: 400,
    reason : 'A column was left NULL that cannot be NULL.'
  },
  'ER_DUP_ENTRY' : {
    code : 'DB.ER_DUP_ENTRY',
    httpStatus: 400,
    reason : 'You cannot insert a duplicate record.  This record already exists.'
  },
  'ER_PARSE_ERROR' : {
    code : 'DB.ER_PARSE_ERROR',
    httpStatus : 400,
    reason : 'Your query cannot be translated into valid SQL.  Please modify your query and try again.'
  },
  'ER_EMPTY_QUERY' :  {
    code : 'DB.ER_EMPTY_QUERY',
    httpStatus : 400,
    reason : 'The query was empty.'
  }
};
