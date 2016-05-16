/* global EventSource */
angular.module('bhima.services')
.service('SystemService', SystemService);

SystemService.$inject = ['$http', 'util'];

/**
 * System Service
 */
function SystemService($http, util) {
  var service = this;
  var baseUrl = '/system';

  // exposed API
  service.information = information;
  service.events = events;
  service.stream = [];

  function information() {
    return $http.get(baseUrl.concat('/information'))
      .then(util.unwrapHttpResponse);
  }

  function events() {
    // forcably clear the event queue
    service.stream.length = 0;

    return $http.get(baseUrl.concat('/events'))
      .then(util.unwrapHttpResponse);
  }

  function handleServerSentEvent(event) {
    console.log('Got Event:', event);
    service.stream.push(JSON.parse(event.data));
  }

  // set up event stream
  var source = new EventSource(baseUrl.concat('/stream'));
  source.addEventListener('message', handleServerSentEvent, false);

  return service;
}
