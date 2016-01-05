angular.module('bhima.controllers')
.controller('payroll', [
  '$scope',
  '$location',
  '$q',
  'validate',
  'appcache',
  function ($scope, $location, $q, validate, AppCache) {
    /**
      * TODO use controller alias as possible and redirect url when no daily exchange rate
      */
    var dependencies = {}, configuration = $scope.configuration = {};
    var session = $scope.session = {
      configure : false,
      complete : false
    };

    var cache = new AppCache('primary_cash');

    dependencies.cashBox = {
      query : {
        tables : {
          cash_box : { columns : ['id', 'text', 'project_id', 'is_auxillary'] }
        },
        where : ['cash_box.is_auxillary=0']
      }
    };

    configuration.operations = [
      {
        key : 'PRIMARY_CASH.EXPENSE.SALARY_PAYMENT',
        link : '/primary_cash/expense/salary_payment/'
      },
      {
        key : 'PRIMARY_CASH.EXPENSE.PARTIAL_PAYMENT',
        link : '/primary_cash/expense/partial_payment/'
      },
      {
        key : 'PRIMARY_CASH.EXPENSE.COTISATION_PAYMENT',
        link : '/primary_cash/expense/cotisation_payment/'
      },
      {
        key : 'PRIMARY_CASH.EXPENSE.TAX_PAYMENT',
        link : '/primary_cash/expense/tax_payment/'
      },
      {
        key : 'PRIMARY_CASH.EXPENSE.ENTERPRISE_TAX_PAYMENT',
        link : '/primary_cash/expense/enterprise_tax_payment/'
      },
      {
        key : 'PRIMARY_CASH.EXPENSE.PAYDAY_ADVANCE_PAYMENT',
        link : '/primary_cash/expense/payday_advance/'
      }
    ];

    validate.process(dependencies)
      .then(parseDependenciesData)
      .then(readConfiguration)
      .then(parseConfiguration)
      .then(initialise)
      .catch(handleError);

    function parseDependenciesData(model) {
      angular.extend($scope, model);
      return $q.when();
    }

    function readConfiguration() {
      return cache.fetch('cash_box');
    }

    function parseConfiguration(cashbox) {
      var currentModel = $scope.cashBox;
      var configurationExists, validConfiguration;

      configurationExists = angular.isDefined(cashbox);
      if (!configurationExists) {
        session.configure = true;
        return;
      }

      validConfiguration = angular.isDefined(currentModel.get(cashbox.id));
      if (!validConfiguration) {
        session.configure = true;
        return;
      }

      session.cashbox = cashbox;
      session.complete = true;
      return;
    }

    function initialise() {
      // Initialise
    }

    function loadPath(path) {
      $location.path(path + session.cashbox.id);
    }

    function setConfiguration (cashbox) {
      cache.put('cash_box', cashbox);
      session.configure = false;
      session.complete = true;
      session.cashbox = cashbox;
    }

    function reconfigure() {
      cache.remove('cash_box');
      session.cashbox = null;
      session.configure = true;
      session.complete = false;
    }

    function handleError(error) {
      throw error;
    }

    $scope.loadPath = loadPath;
    $scope.setConfiguration = setConfiguration;
    $scope.reconfigure = reconfigure;
  }
]);
