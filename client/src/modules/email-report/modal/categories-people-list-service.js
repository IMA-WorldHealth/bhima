angular.module('bhima.services')
    .service('CategoriesPeopleService', CategoriesPeopleService);

CategoriesPeopleService.$inject = [
    '$http', 'util', 'SessionService', '$uibModal',
    'DocumentService', 'VisitService', 'DepricatedFilterService',
];

/**
 * @module EmailReportService
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /tools/bed/ API.
 */
function CategoriesPeopleService($http, util, Session, $uibModal,
    Documents, Visits, Filters) {

    var service = this;
    service.list = [];

    init();
    function init() {
        service.list = [
            {
                table: 'employee',
                table_display: 'FORM.LABELS.EMPLOYEES',
                Columns: ['display_name', 'email'],
                Columns_dispay: ['Name', 'email']
            },
            {
                table: 'user',
                table_display: 'FORM.LABELS.USERS',
                Columns: ['username', 'email'],
                Columns_dispay: ['Name', 'email']
            },
        ]
    }


    return service;
}