/**
* Application Error Codes
*
* These codes are to be attached to the res object, and used to throw errors
* within the application.  The basic usage should be either:
*  1) next(res.errors.ERR_NOT_FOUND);
*  2) .then(function () { throw res.errors.ERR_NOT_FOUND; }).catch(next);
*
*  The JSON below defines the error codes throughout the application.
*/

// TODO -- add more error codes
module.exports = {
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
    reason : 'An enterprise does not exist within the application to login to.'
  },
  'ERR_NO_PROJECT' : {
    code : 'ERR_NO_PROJECT',
    httpStatus : 401,
    reason : 'A project does not exist within the applicaiton to login to.'
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
    reason : 'That Request require some necessary parameters which are missing'
  },

  'ERR_NEGATIVE_VALUES' : {
    code : 'ERR_NEGATIVE_VALUES',
    httpStatus : 400,
    reason : 'Expected some value(s) to be positive, but received a negative value.'
  }

 'ERR_BAD_VALUE' : {
   code : 'ERR_BAD_VALUE',
   httpStatus : 400,
   reason : 'You sent a bad value for some parameters'	
 }
};
