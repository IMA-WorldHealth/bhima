angular.module('bhima.controllers')
.controller('PrimaryCashSupportController', PrimaryCashSupportController);

PrimaryCashSupportController.$inject = [
  '$scope', '$q', '$location', '$routeParams', 'validate', 'connect',
  'messenger', 'util', 'uuid', 'appcache', '$translate', 'precision', 'SessionService',
];

function PrimaryCashSupportController($scope, $q, $location, $routeParams, validate, connect, messenger, util, uuid, Appcache, $translate, precision, Session) {
  var dependencies = {},
      record_uuid = -1,
      cache = new Appcache('convention');

  $scope.cashbox_id = $routeParams.cashbox_id;
  $scope.enterprise = Session.enterprise;
  $scope.project = Session.project;

  dependencies.cash_box = {
    required : true,
    query : {
      tables : {
        'cash_box_account_currency' : {
          columns : ['id', 'currency_id', 'account_id']
        },
        'currency' : {
          columns : ['symbol', 'min_monentary_unit']
        },
        'cash_box' : {
          columns : ['id', 'text', 'project_id']
        }
      },
      join : [
        'cash_box_account_currency.currency_id=currency.id',
        'cash_box_account_currency.cash_box_id=cash_box.id'
      ],
      where : [
        'cash_box_account_currency.cash_box_id=' + $scope.cashbox_id
      ]
    }
  };

  dependencies.exchange_rate = {
    required : true,
    query : {
      tables : {
        'exchange_rate' : {
          columns : ['id', 'enterprise_id', 'currency_id', 'date', 'rate']
        }
      },
      where : ['exchange_rate.date=' + util.sqlDate(new Date())]
    }
  };

  dependencies.accounts = {
    required : true,
    query : {
      tables : {
        'account' : {
          columns : ['id','account_number', 'account_txt']
        }
      },
      where: ['account.enterprise_id=' + $scope.enterprise.id]
    }
  };

  dependencies.pcash_module = {
    required : true,
    query : {
      tables : {
        'primary_cash_module' : {
          columns : ['id']
        }
      },
      where : ['primary_cash_module.text=convention']
    }
  };

  $scope.noEmpty = false;
  $scope.som = 0;
  $scope.convention = {};
  $scope.data = {};
  $scope.model = {};

  function init (model) {
    $scope.model = model;
  }

  function ready(model) {
    $scope.som = 0;
    $scope.overviews = model.situations.data.filter(function (situation) {
      if (situation.balance > 0)  {
        $scope.som += situation.balance;
      }
      return situation.balance > 0;
    });
    $scope.som = precision.round($scope.som,2);
    $scope.noEmpty = true;
  }

  function initialiseEmployee(selectedEmployee) {
    if (!selectedEmployee) {
      $translate('CONVENTION.NO_CONVENTION')
      .then(function (value) {
        return messenger.danger(value);
      });
    }

    $scope.selectedEmployee = selectedEmployee;

    dependencies.situations = { query : '/ledgers/employee_invoice/' + $scope.selectedEmployee.creditor_uuid};
    validate.process(dependencies, ['situations'])
    .then(ready);
  }

  function pay() {
    var record = {
      uuid            : uuid(),
      project_id      : $scope.project.id,
      type            : 'E',
      date            : util.sqlDate(new Date().toString()),
      currency_id     : $scope.selectedItem.currency_id,
      deb_cred_uuid   : $scope.selectedEmployee.creditor_uuid,
      account_id      : $scope.selectedEmployee.account_id,
      cost            : $scope.data.payment,
      user_id         : Session.user.id,
      description     : ['EMPLOYE', $scope.selectedEmployee.name, util.sqlDate(new Date().toString())].join('/'),
      cash_box_id     : $scope.cashbox_id,
      origin_id       : $scope.model.pcash_module.data[0].id
    };

    writePay(record)
    .then(writeItem)
    .then(postToJournal)
    .then(handleSucces);
  }

  function postToJournal(resu) {
    record_uuid = resu[0].config.data.data[0].primary_cash_uuid;
    return connect.fetch('/journal/pcash_employee/' + record_uuid);
  }

  function writePay(record) {
    return connect.post('primary_cash', [record]);
  }

  function writeItem (result) {
    var pcashItems = getPcashItems($scope.data.payment, result);
    return $q.all(pcashItems.map(function (pcash_item) {
      return connect.post('primary_cash_item', [pcash_item]);
    }));
  }

  function getPcashItems(max_amount, result) {
    var items = [];
    var cost_received = max_amount;

    if ($scope.selectedItem.currency_id === $scope.enterprise.currency_id) {
      for (var i = 0; i < $scope.overviews.length; i += 1) {
        cost_received -= $scope.overviews[i].balance;
        if (cost_received >= 0) {
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : $scope.overviews[i].balance, credit : 0, inv_po_id : $scope.overviews[i].inv_po_id, document_uuid : $scope.overviews[i].inv_po_id });
        } else {
          cost_received+=$scope.overviews[i].balance;
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : cost_received, credit : 0, inv_po_id : $scope.overviews[i].inv_po_id, document_uuid : $scope.overviews[i].inv_po_id});
          break;
        }
      }
    } else {
      var rate = $scope.model.exchange_rate.data[0];
      for (var j = 0; j < $scope.overviews.length; j += 1) {
        var value = ($scope.overviews[j].balance * rate.rate);
        cost_received -= value;
        if (cost_received >= 0) {
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : value, credit : 0, inv_po_id : $scope.overviews[j].inv_po_id, document_uuid : $scope.overviews[j].inv_po_id});
        } else {
          cost_received += value;
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : cost_received, credit : 0, inv_po_id : $scope.overviews[j].inv_po_id, document_uuid : $scope.overviews[j].inv_po_id});
          break;
        }
      }
    }
    return items;
  }

  function setCashAccount(cashAccount) {
    if (cashAccount) {
      $scope.selectedItem = cashAccount;
      cache.put('selectedItem', cashAccount);
    }
  }

  function handleSucces() {
    $scope.selectedEmployee = {};
    $scope.data = {};
    $scope.noEmpty = false;
    if (record_uuid !== -1) {
      $location.path('/invoice/pcash_employee/' + record_uuid);
    }
  }


  function load(selectedItem) {
    if (!selectedItem) { return ; }
    $scope.selectedItem = selectedItem;
  }

  cache.fetch('selectedItem').then(load);

  function startup() {
    validate.process(dependencies)
    .then(init)
    .catch(function (err) {
      messenger.danger($translate.instant('CONVENTION.LOADING_ERROR'));
    });
  }

  function check() {
    if ($scope.data.payment) {
      if ($scope.selectedItem.currency_id !== $scope.enterprise.currency_id) {
        var rate = $scope.model.exchange_rate.data[0];
        return $scope.data.payment < $scope.selectedItem.min_monentary_unit || $scope.data.payment > $scope.som * rate.rate;
      } else {
        return $scope.data.payment < $scope.selectedItem.min_monentary_unit || $scope.data.payment > $scope.som;
      }
    } else {
       return true;
    }
  }

  $scope.initialiseEmployee = initialiseEmployee;
  $scope.pay = pay;
  $scope.setCashAccount = setCashAccount;
  $scope.check = check;

  startup();
}
