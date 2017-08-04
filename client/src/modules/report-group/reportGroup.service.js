angular.module('bhima.services')
    .service('ReportGroupService', ReportGroupService);

ReportGroupService.$inject = [
  '$http', 'util',
];

/**
 * @module ReportGroupService
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /tools/bed/ API.
 */
function ReportGroupService($http, util) {

  var service = this;
  var baseUrl = '/report-group/';

  service.read = read;
  service.create = create;
  service.remove = remove;
  service.update = update;

  /**
  * This method accepts information recorded by a controllers form, formats it
  * for submission and forwards it to the server /report-group API. It can
  * be used for creating new bed records in the database.
  *
  * @param {Object} report_Group   A patients report Group information.
  *            Promise object returning success/failure confirmation.
  */

  function create(reportGroup_) {
    var formatBedRequest = {
      reportGroup : reportGroup_,
    };

    return $http.post(baseUrl, formatBedRequest)
    .then(util.unwrapHttpResponse);
  }

    // reading data from the server
  function read() {
    return $http.get(baseUrl, {})
            .then(util.unwrapHttpResponse);
  }

    // deteting a record from the server
  function remove(_Code) {
    return $http.delete(baseUrl + _Code, {})
    .then(util.unwrapHttpResponse);
  }

  // updating
  function update(reportGroup_) {
    var formatBedRequest = {
      reportGroup : reportGroup_,
    };

    return $http.put(baseUrl, formatBedRequest)
                .then(util.unwrapHttpResponse);
  }

  return service;
}
