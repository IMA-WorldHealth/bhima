angular.module('bhima.services')
  .service('EmailReportService', EmailReportService);

EmailReportService.$inject = [ '$http', 'util' ];

/**
 * @module EmailReportService
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /email-report/ API.
 */
function EmailReportService($http, util) {

  var service = this;
  service.frequencies = [
    { key : 'Daily', label : 'FORM.LABELS.DAILY' },
    { key : 'Weekly', label : 'FORM.LABELS.WEEKLY' },
    { key : 'Monthly', label : 'FORM.LABELS.MONTHLY' },
  ];


  const baseUrl = '/email-report/';
  const baseUrlListPeople = '/email-report/list-people';

  service.read = read;
  service.create = create;
  service.readPeople = readPeople;
  service.remove = remove;
  service.update = update;

  /**
   * This method accepts information recorded by a controllers form, formats it
   * for submission and forwards it to the server /email-report API. It can
   * be used for creating new email for reporting record in the database.
   *
   * @param {Object} email_report   email for reporting information.
   * @returns {Object}          Promise object returning success/failure confirmation.
   */
  function create(_emailReport) {
    var formatBedRequest = {
      emailReport: _emailReport,
    };

    return $http.post(baseUrl, formatBedRequest)
      .then(util.unwrapHttpResponse);
  }


  /**
   * This method accepts information recorded by a controllers form, formats it
   * for submission and forwards it to the server  /email-report/:id API. It can
   * be used for creating new email for reporting record in the database.
   *
   * @param {Object} email_report   email for reporting information.
   * @returns {Object}          Promise object returning success/failure confirmation.
   */
  function update(_emailReport) {
    var formatBedRequest = {
      emailReport: _emailReport,
    };

    return $http.put(baseUrl + _emailReport.id, formatBedRequest)
      .then(util.unwrapHttpResponse);
  }

  // reading data from the server
  function read() {
    return $http.get(baseUrl, {})
      .then(util.unwrapHttpResponse);
  }

  /*
   reading data from the server,
   here we load a groupe of people(users, patients,donators,..),
   the group is detected once the user select an item in the modal
   , also the query if formed by the item's infomation
   Those items come from CategoriesPeopleService in the modal folder
   */
  function readPeople(sqlParams) {
    return $http.get(baseUrlListPeople + '/' + sqlParams.table + '/' + sqlParams.Columns[0] + '/' + sqlParams.Columns[1])
      .then(util.unwrapHttpResponse);
  }

  /*
   delete an email report (a profile)
   */
  function remove(_id) {
    return $http.delete(baseUrl + _id)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
