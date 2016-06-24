angular.module('bhima.services')
.service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = ['$http', 'util'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService($http, util) {
  'use strict';

  var service = this;

  const baseUrl = '/journal/';

  // expose the services method's
  service.read = read;

  /** Getting posting journal data */
   function read() {
     return $http.get(baseUrl)
      .then(util.unwrapHttpResponse);
   }
}
