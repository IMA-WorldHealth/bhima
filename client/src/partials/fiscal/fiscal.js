angular.module('bhima.controllers')
.controller('FiscalController', FiscalController);

FiscalController.$inject = [
  '$scope', '$http', '$translate', 'appstate', 'validate', 'SessionService'
];

function FiscalController ($scope, $http, $translate, appstate, validate, sessionService) {
  var dependencies = {};

  $scope.user = sessionService.user;
  $scope.project = sessionService.project;

  // register dependencies
  dependencies.fiscal = {
    query : {
      tables : {
        fiscal_year : {
          columns : ['id', 'fiscal_year_txt', 'number_of_months', 'start_month', 'start_year', 'previous_fiscal_year', 'locked']
        }
      }
    }
  };

  // expose bindings to the view
  $scope.selectYear   = selectYear;
  $scope.selectLock   = selectLock;
  $scope.getTypeSolde = getTypeSolde;
  $scope.getSolde     = getSolde;
  $scope.error        = error;

  // start up the module
  function startup() {
    $scope.enterprise = sessionService.enterprise;
    dependencies.fiscal.where = ['fiscal_year.enterprise_id=' + $scope.enterprise.id];
    validate.refresh(dependencies)
    .then(function (models) {
      angular.extend($scope, models);
    })
    .catch(error);
  }

  // select a fiscal year for editting
  function selectYear(id) {
    $scope.selectedToLock = null; // Skip selected for lock style
    $scope.selected = id;
    $scope.active = 'update';
    $scope.$broadcast('fiscal-year-selection-change', id);
  }

  // select a fiscal year for lock
  function selectLock(id) {
    var choice = confirm($translate.instant('FISCAL_YEAR.CONFIRM_LOCKING'));
    if (choice) {
      $scope.selected = null; // Skip selected for update style
      $scope.selectedToLock = id;
      $scope.active = 'lock';
      $scope.$broadcast('fiscal-year-selection-lock-change', id);
    }
  }

  /**
    * This function is responsible to get account's solde according:
    * fiscal year and account number
    */
  function getSolde (classe, fy) {
    return $http.get('/getClassSolde/'+classe+'/'+fy)
    .then(function (data) {
      return data;
    })
    .catch(error);
  }

  /**
    * This function is responsible to get account's solde according:
    * fiscal year, account type and is_charge
    */
  function getTypeSolde (fiscalYearId, accountType, isCharge) {
    /**
      * NOTA: `accountType` must have one of these values 1, 2 or 3
      * 1 for income/expense accounts
      * 2 for balance accounts
      * 3 for title accounts
      * NOTA: `isCharge` is either 1 or 0
      */
    accountType = accountType === 'INCOME_EXPENSE' || accountType === 1 ? 1 :
                  accountType === 'BALANCE' || accountType === 2 ? 2 :
                  accountType === 'TITLE' || accountType === 3 ? 3 : null;

    isCharge = isCharge === 1 || isCharge === true || isCharge === 'CHARGE' ? 1 : 0;

    return $http.get('/getTypeSolde/'+fiscalYearId+'/'+accountType+'/'+isCharge)
    .then(function (data) {
      return data;
    })
    .catch(error);
  }

  /**
    * Error Handler
    */
  function error(err) {
    console.error(err);
  }


  // activate create template and deselect selection
  $scope.createFiscalYear = function createFiscalYear() {

    // FIXME : force refresh when clicking the button multiple
    // times.
    $scope.$broadcast('fiscal-year-create-refresh');

    $scope.active = 'create';
    $scope.selected = null;
    $scope.selectedToLock = null;
  };

  // listen for create event and refresh fiscal year data
  $scope.$on('fiscal-year-creation', function (e, id) {
    startup();
  });

  startup();
}
