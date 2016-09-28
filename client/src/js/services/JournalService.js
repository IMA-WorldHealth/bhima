angular.module('bhima.services')
.service('JournalService', JournalService);

// Dependencies injection
JournalService.$inject = ['PrototypeApiService'];

/**
 * Journal Service
 * This service is responsible of all process with the posting journal
 */
function JournalService(Api) {
  var service = new Api('/journal/');
  return service;
}
