angular.module('bhima.routes')
    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider
            .state('reportGroup', {
                url: '/report-group/',
                controller: 'ReportGroupController as ReportGroupCtrl',
                templateUrl: 'modules/report-group/index.html',
                params: {
                    data: null,
                }

            })
    }]);
