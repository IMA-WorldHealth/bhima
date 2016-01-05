angular.module('bhima.services')
.service('errorCodes', function () {
  return {
    'ERR_TXN_IMBALANCE' : {
      title             : 'Transaction Imbalance',
      ref               : 'ERR_TXN_IMBALANCE',
      description       : 'Imbalanced transaction(s) detected',
    },
    'ERR_TXN_ZERO' : {
      title        : 'Zero-Valued Lines',
      ref          : 'ERR_TXN_ZERO',
      description  : 'Invalid transaction(s) line missing both debit and credit amounts',
    },
    'ERR_TXN_CORRUPT_DATE' : {
      title                : 'Corrupt Transaction Date',
      ref                  : 'ERR_TXN_CORRUPT_DATE',
      description          : 'Corrupted date detected in transaction(s)',
    },
    'ERR_TXN_MULTI_DATE' : {
      title              : 'Multiple Transaction Dates',
      ref                : 'ERR_TXN_MULTI_DATE',
      description        : 'Transaction dates do not agree.  Multiple dates detected for single transaction(s)',
    },
    'ERR_TXN_EMPTY_ACCOUNT' : {
      title                 : 'Empty Transaction Account',
      ref                   : 'ERR_TXN_EMPTY_ACCOUNT',
      description           : 'Empty account field detect in transaction(s)',
    },
    'ERR_TXN_EMPTY_DC_TYPE' : {
      ref                   : 'ERR_TXN_EMPTY_DC_TYPE',
      title                 : 'Empty Debitor/Creditor Type',
      description           : 'Empty debitor/creditor type detected in transaction(s) with debitor/creditor id present',
    },
    'ERR_TXN_EMPTY_DC_UUID' : {
      ref                   : 'ERR_TXN_EMPTY_DC_UUID',
      title                 : 'Empty Debitor/Creditor ID',
      description           : 'Empty debitor/creditor ID detected in transaction(s) with debitor/creditor type present',
    },
    'ERR_TXN_UNRECOGNIZED_DATE' : {
      ref                       : 'ERR_TXN_UNRECOGNIZED_DATE',
      title                     : 'Unrecognized Transaction Date',
      description               : 'Unrecognized dates in transaction(s).  Dates do not fall within a valid fiscal year',
    },
    'ERR_TXN_UNRECOGNIZED_DC_UUID' : {
      ref                          : 'ERR_TXN_UNRECOGNIZED_DC_UUID',
      title                        : 'Unrecognized Debitor/Creditor ID',
      description                  : 'Unrecognized debitor/creditor ID in transaction(s)',
    },
    'ERR_HTTP_UNREACHABLE' : {
      title                : 'Server Unreachable',
      ref                  : 'ERR_HTTP_UNREACHABLE',
      description          : 'Server returned a 404 unreachable response.',
    },
    'ERR_HTTP_INTERNAL' : {
      title             : 'Internal Server Error',
      ref               : 'ERR_HTTP_INTERNAL',
      description       : 'Server returned a 500 internal error response.',
    },
    'ERR_AUTH_UNAUTHORIZED' : {
      title                 : 'Authorized Access',
      ref                   : 'ERR_AUTH_UNAUTHORIZED',
      description           : 'User is not authorized to perform this action.',
    },
    'ERR_AUTH_UNRECOGNIZED' : {
      title                 : 'Unrecognized User',
      ref                   : 'ERR_AUTH_UNRECOGNIZED',
      description           : 'Invalid or unrecognized PIN registration.',
    },
    'ERR_SESS_EXPIRED' : {
      title            : 'Session Expired',
      ref              : 'ERR_SESS_EXPIRED',
      description      : 'Authenticated session has expired.'
    },
    'ERR_QUERY'   : {
      title       : 'Database Exception',
      ref         : 'ERR_QUERY',
      description : 'The database raised an exception to the query. Please contact a sysadmin.'
    },
    'ERR_ACCOUNT_LOCKED' : {
      title              : 'Locked Accounts',
      ref                : 'ERR_ACCOUNT_LOCKED',
      description        : 'Locked accounts included in transaction(s).'
    },
    'ERR_ACCOUNT_NULL' : {
      title            : 'Null Accounts',
      ref              : 'ERR_ACCOUNT_NULL',
      description      : 'Undefined or null accounts included in transaction(s).'
    },
    'ERR_RECORD_NOT_FOUND' : {
      title : 'Record Not Found',
      ref : 'ERR_RECORD_NOT_FOUND',
      description : 'The record you were looking for could not be retrieved'
    }
  };
});
