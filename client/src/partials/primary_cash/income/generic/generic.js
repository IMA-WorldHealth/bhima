angular.module('bhima.controllers')
.controller('PrimaryCashIncomeGenericController', PrimaryCashIncomeGenericController);

PrimaryCashIncomeGenericController.$inject = [
  '$scope', '$routeParams', '$translate', 'validate', 'messenger', 'SessionService',
  'connect', 'uuid', 'util', '$location', 'appcache', 'exchange'
];

function PrimaryCashIncomeGenericController ($scope, $routeParams, $translate, validate, messenger, SessionService, connect, uuid, util, $location, Appcache, exchange) {
  var isDefined    = angular.isDefined,
      dependencies = {},
      session      = $scope.session = { receipt : {}, configured : false, complete : false },
      cache        = new Appcache('income');

  // set proper dates
  session.today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(session.today.getDate() + 1);
  session.tomorrow = tomorrow;
  isDefined = angular.isDefined;
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
          columns : ['id', 'account_txt', 'account_number', 'is_ohada']
        }
      },
      where : ['account.is_ohada=1', 'AND', 'account.account_type_id<>3']
    }
  };

  // Expose to view
  $scope.update           = update;
  $scope.setCurrency      = setCurrency;
  $scope.formatAccount    = formatAccount;
  $scope.clear            = clear;
  $scope.submit           = submit;
  $scope.reconfigure      = reconfigure;
  $scope.setConfiguration = setConfiguration;

  // Watchers
  $scope.$watchCollection('session.receipt', valid);
  $scope.$watchCollection('session.currency', valid);

  // Startup
  startup();
  cache.fetch('currency').then(load);
  cache.fetch('account').then(getAccount);

  // Functions
  function load (currency) {
    if (!currency) { return; }
     $scope.session.currency = currency;
  }

  function getAccount (ac) {
    if (!ac) { return; }
     session.configured = true;
     session.ac = ac;
     session.complete = true;
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

  function clear () {
    session.receipt = {};
    session.receipt.date = new Date();
    session.receipt.value = 0.00;
    session.receipt.cash_box_id = $routeParams.id;
  }

  function hasDailyRate(date) {
    session.hasDailyRate = exchange.hasDailyRate(date);
  }

  function valid () {
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

  function update (value) {
    session.receipt.recipient = value;
  }

  function error (err) {
    messenger.error(err);
  }

  function submit () {
    var data, receipt = session.receipt;

    data = {
      uuid          : uuid(),
      project_id    : $scope.project.id,
      type          : 'E',
      date          : util.sqlDate(receipt.date),
      account_id    : session.ac.id,
      currency_id   : session.currency.id,
      cost          : receipt.cost,
      user_id       : SessionService.user.id,
      description   : 'HBB' + '_CP. REC GEN/' + receipt.description, //fix me
      cash_box_id   : receipt.cash_box_id,
      origin_id     : 5,
    };

    connect.post('primary_cash', [data])
    .then(function () {
      var receiptReference = uuid();
      var item = {
        uuid              : uuid(),
        primary_cash_uuid : data.uuid,
        debit             : data.cost,
        credit            : 0,
        document_uuid     : receiptReference
      };
      return connect.post('primary_cash_item', [item]);
    })
    .then(function () {
      return connect.fetch('/journal/primary_income/' + data.uuid);
    })
    .then(function () {
      // invoice
      messenger.success($translate.instant('ALLTRANSACTIONS.DATA_POSTED'));
      $location.path('/invoice/generic_income/' + data.uuid);
    })
    .catch(error);
  }

  function setCurrency (obj) {
    $scope.session.currency=obj;
    cache.put('currency', obj);
  }

  function formatAccount (ac) {
    if (ac) {return ac.account_number + ' - ' + ac.account_txt;}
  }

  function reconfigure () {
    session.ac = null;
    session.configured = false;
    session.complete = false;
  }

  function setConfiguration (ac) {
    if (ac) {
      cache.put('account', ac);
      session.configured = true;
      session.ac = ac;
      session.complete = true;
    }
  }

}
