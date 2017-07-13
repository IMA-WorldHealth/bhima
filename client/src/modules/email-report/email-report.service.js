angular.module('bhima.services')
        .service('EmailReportService', EmailReportService);

EmailReportService.$inject = [
    '$http', 'util', 'SessionService', '$uibModal',
    'DocumentService', 'VisitService', 'DepricatedFilterService',
];

/**
 * @module EmailReportService
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /email-report/ API.
 */
function EmailReportService($http, util, Session, $uibModal,Documents, Visits, Filters) {

    var service = this;
    
    service.frequencies = ["Dayly", "Weekly", "Monthly"];

    var baseUrl = '/email-report/';
    var baseUrl_list_people = '/email-report/list-people';
    var baseUrl = '/email-report/';

    var filter = new Filters();

    service.read = read;
    service.create = create;
    service.read_people = read_people;
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
    function create(email_report) {
        var formatBedRequest = {
            emailReport: email_report
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
    function update(email_report) {
        var formatBedRequest = {
            emailReport: email_report
        };

        return $http.put(baseUrl + email_report.id, formatBedRequest)
                .then(util.unwrapHttpResponse);
    }

    //reading data from the server
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
    function read_people(query) {
        return $http.post(baseUrl_list_people, {sql: query})
                .then(util.unwrapHttpResponse);
    }


    /*
     delete an email report (a profile)
     */
    function remove(_id) {
        return $http.delete(baseUrl + _id, {})
                .then(util.unwrapHttpResponse);
    }


    return service;
}