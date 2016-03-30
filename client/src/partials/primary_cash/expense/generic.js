angular.module('bhima.controllers')
.controller('PrimaryCashExpenseGenericController', PrimaryCashExpenseGenericController);

PrimaryCashExpenseGenericController.$inject = [
  '$scope', '$routeParams', '$translate', 'validate', 'messenger', 'SessionService',
  'connect', 'uuid', 'util', 'appcache', '$location', 'exchange'
];

function PrimaryCashExpenseGenericController ($scope, $routeParams, $translate, validate, messenger, SessionService, connect, uuid, util, Appcache, $location, exchange) {
  var tomorrow,
      isDefined    = angular.isDefined,
      dependencies = {},
      session      = $scope.session = { receipt : {}, configure : false, complete : false },
      cache        = new Appcache('expense');

  session.today = new Date();
  tomorrow = new Date();
  tomorrow.setDate(session.today.getDate() + 1);
  session.tomorrow = tomorrow;

  dependencies.currencies = {
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'name', 'symbol']
        }
      }
    }
  };

  dependencies.accounts = {
    query : {
      tables : {
        'account' :{
          columns : ['id', 'label', 'number', 'is_ohada']
        }
      },
      where : ['account.is_ohada=1', 'AND', 'account.type_id<>3']
    }
  };

  // Expose to view
  $scope.update           = update;
  $scope.setCurrency      = setCurrency;
  $scope.clear            = clear;
  $scope.submit           = submit;
  $scope.formatAccount    = formatAccount;
  $scope.reconfigure      = reconfigure;
  $scope.setConfiguration = setConfiguration;

  // Watchers
  // TODO -- replace validation $watchers with angular validation
  $scope.$watchCollection('session.receipt', valid);
  $scope.$watchCollection('session.currency', valid);

  // Startup
  startup();
  cache.fetch('currency').then(load);
  cache.fetch('account').then(getAccount);

  // Functions
  function load(currency) {
    if (!currency) { return; }
    session.currency = currency;
  }

  function startup() {
    if (!exchange.hasDailyRate()) { $location.path('/primary_cash/'); }

    if (Number.isNaN(Number($routeParams.id))) {
      throw new Error('No cashbox selected');
    }

    $scope.timestamp = new Date();

    // init models
    $scope.project =  SessionService.project;
    validate.process(dependencies)
    .then(function (models) {
      angular.extend($scope, models);
      session.receipt.date = new Date();
      session.receipt.cost = 0.00;
      session.receipt.cash_box_id = $routeParams.id;
      session.accounts = models.accounts.data;
    })
    .catch(error);
  }

  function getAccount(ac) {
    if (!ac) { return; }
     session.configured = true;
     session.ac = ac;
     session.complete = true;
  }

  function clear() {
    session.receipt = {};
    session.receipt.date = new Date();
    session.receipt.value = 0.00;
    session.receipt.cash_box_id = $routeParams.id;
  }

  function hasDailyRate(date) {
    session.hasDailyRate = exchange.hasDailyRate(date);
  }

  function valid() {
    if (!session || !session.receipt) {
      session.invalid = true;
      return;
    }
    var r = session.receipt;

    session.invalid = !(isDefined(session.currency) &&
      isDefined(r.cost) &&
      r.cost > 0 &&
      isDefined(r.description) &&
      isDefined(r.date) &&
      isDefined(r.cash_box_id));

    hasDailyRate(r.date);
  }

  function submit () {
    var data, receipt = session.receipt;

    data = {
      uuid          : uuid(),
      reference     : 1,
      project_id    : $scope.project.id,
      type          : 'E',
      date          : util.sqlDate(receipt.date),
      account_id    : session.ac.id,
      currency_id   : session.currency.id,
      cost          : receipt.cost,
      user_id       : SessionService.user.id,
      description   : 'HBB' + '_C.P DEP GEN/' + receipt.description, // FIXME -- hard coded name
      cash_box_id   : receipt.cash_box_id,
      origin_id     : 4,
    };

    connect.post('primary_cash', [data])
    .then(function () {
      var receiptReference = uuid();
      var item = {
        uuid              : uuid(),
        primary_cash_uuid : data.uuid,
        debit             : 0,
        credit            : data.cost,
        document_uuid     : receiptReference
      };

      return connect.post('primary_cash_item', [item]);
    })
    .then(function () {
      return connect.fetch('/journal/primary_expense/' + data.uuid);
    })
    .then(function () {

      // invoice
      messenger.success($translate.instant('ALLTRANSACTIONS.DATA_POSTED'));
      $location.path('/invoice/generic_expense/' + data.uuid);
    })
    .catch(error);
  }

  function setCurrency(obj) {
    session.currency = obj;
    cache.put('currency', obj);
  }

  function update(value) {
    session.receipt.recipient = value;
  }

  function error(err) {
    messenger.error(err);
  }

  function formatAccount(ac) {
    if (ac) {
      return ac.number + ' - ' + ac.label;
    }
  }

  function reconfigure() {
    session.configured = false;
    session.ac = null;
    session.complete = false;
  }

  function setConfiguration(ac) {
    if (ac) {
      cache.put('account', ac);
      session.configured = true;
      session.ac = ac;
      session.complete = true;
    }
  }
}
