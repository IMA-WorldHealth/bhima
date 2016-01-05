angular.module('bhima.controllers')
.controller('FiscalUpdateController', FiscalUpdateController);

FiscalUpdateController.$inject = [
  '$route', '$scope', 'validate', 'connect'
];

/**
* Fiscal Update Controller
*
* Responsible for updating a created fiscal year.
*/
function FiscalUpdateController($route, $scope, validate, connect) {
  var imports,
      editCache,
      query,
      isEditted,
      isDefined = angular.isDefined,
      session = $scope.session = {},
      dependencies = {};

  // pull in data from the parent controller to use
  // in child requests.
  imports = $scope.$parent;

  // expose bindings to the scope
  $scope.getFiscalStart = getFiscalStart;
  $scope.getFiscalEnd = getFiscalEnd;
  $scope.submitEdits = submitEdits;
  $scope.resetEdits = resetEdits;

  // dependencies
  dependencies.fiscal = {
    query : {
      tables : {
        fiscal_year : {
          columns : ['id', 'number_of_months', 'fiscal_year_txt', 'transaction_start_number', 'transaction_stop_number', 'start_month', 'start_year', 'previous_fiscal_year', 'locked']
        }
      }
    }
  };

  dependencies.balances = {
    query : {
      tables : {
        'period_total' : {
          columns : ['account_id', 'debit', 'credit', 'locked']
        },
        'period' : {
          columns : ['period_number']
        },
        'account' : {
          columns: ['account_txt', 'account_number']
        },
        'account_type' : {
          columns : ['type']
        }
      },
      join : [
        'period_total.account_id=account.id',
        'period_total.period_id=period.id',
        'account.account_type_id=account_type.id'
      ],
      where : [
        'period_total.fiscal_year_id=?',
        'AND', 'period.period_number=0',
        'AND', 'period_total.enterprise_id=?'
      ]
    }
  };

  dependencies.periods = {
    query : {
      tables : {
        period : {
          columns : ['id', 'period_start', 'period_stop']
        }
      },
      where : [
        'period.fiscal_year_id=',
        'AND', 'period.period_number<>0'
      ]
    }
  };

  // Fires on load of this controller
  function onLoad() {

    // copy the fiscal year id from the parent controller
    var id = imports.selected;

    // format queries with the imported fiscal year parameter
    dependencies.fiscal.query.where = ['fiscal_year.id=' + id];
    dependencies.periods.query.where[0] = 'period.fiscal_year_id=' + id;

    validate.refresh(dependencies, ['fiscal', 'periods'])
    .then(function (models) {

      // expose the data to the template
      $scope.fiscal = models.fiscal.data[0];
      $scope.periods = models.periods;

      // cache the fiscal year data for expected edits
      editCache = angular.copy($scope.fiscal);
    });
  }

  // Submits the edits made to the fiscal year
  // TODO Formalize the validation and save features herein
  function submitEdits() {
    var edits = connect.clean($scope.fiscal);
    connect.put('fiscal_year', [edits], ['id'])
    .then(function (results) {
      editCache = angular.copy(edits);
      session.saved = true;
    })
    .catch(function (err) {
      session.saveError = true;
    })
    .finally();
  }

  // resets the fiscal year with the old edits
  function resetEdits() {
    session.saved = false;
    session.saveError = false;
    $scope.fiscal = angular.copy(editCache);
    $route.reload();
  }

  // returns true if the fiscal year has periods
  function hasPeriods() {
    return isDefined($scope.periods) && isDefined($scope.periods.data[0]);
  }

  // get the first period of the fiscal year
  function getFiscalStart() {
    if (hasPeriods()) {
      return $scope.periods.data[0].period_start;
    }
  }

  // get the last period of the fiscal year
  function getFiscalEnd() {
    if (hasPeriods()) {
      var periods = $scope.periods.data;
      var lastPeriod = periods[periods.length-1];
      return lastPeriod.period_stop;
    }
  }

  // Fire off the onload function for this controller
  onLoad();

  // Reload the controller on selection change
  $scope.$on('fiscal-year-selection-change', onLoad);
}
