angular.module('bhima.controllers')
.controller('StockStoreReportController', StockStoreReportController);

StockStoreReportController.$inject = [
  '$scope', '$location', 'validate', 'SessionService'
];

function StockStoreReportController ($scope, $location, validate, SessionService) {

  var dependencies = {},
      session = $scope.session = {};

  dependencies.depots = {
    query : {
      tables : {
        depot : {
          columns : ['uuid', 'reference', 'text']
        }
      }
    }
  };

  // Expose to the view
  $scope.submit = submit;

  startup();

  function startup () {
    validate.process(dependencies, ['depots']).then(initialize);
  }

  function initialize (model) {
    angular.extend($scope, model);
  }

  function submit () {
    if (session.depot) {
      $location.path('/reports/stock_store/' + session.depot);
    }
  }

}
