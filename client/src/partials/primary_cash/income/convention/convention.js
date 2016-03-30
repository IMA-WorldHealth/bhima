angular.module('bhima.controllers')
.controller('PrimaryCashConventionController', PrimaryCashConventionController);

PrimaryCashConventionController.$inject = [
  '$q', '$location', '$routeParams', 'validate', 'connect',
  'messenger', 'util', 'uuid', 'appcache', '$translate', 'precision', 'SessionService'
];

function PrimaryCashConventionController ($q, $location, $routeParams, validate, connect, messenger, util, uuid, Appcache, $translate, precision, SessionService) {
  var vm = this,
      dependencies = {}, record_uuid = -1,
      cache = new Appcache('convention');

  vm.cashbox_id = $routeParams.cashbox_id;

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
        'cash_box_account_currency.cash_box_id=' + vm.cashbox_id
      ]
    }
  };

  dependencies.exchange_rate = {
    required : true,
    query : {
      tables : {
        'exchange_rate' : {
          columns : ['id', 'enterprise_id', 'currency_id', 'date', 'rate']
        },
        'enterprise'  : {
          columns : ['id', 'currency_id::enterprise_currency_id']
        }  
      },
      join : ['exchange_rate.enterprise_id=enterprise.id'],
      where : ['exchange_rate.date='+util.sqlDate(new Date())]
    }
  };

  dependencies.accounts = {
    required : true,
    query : {
      tables : {
        'account' : {
          columns : ['id','number', 'label']
        }
      }
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

  // Expose to view
  vm.noEmpty              = false;
  vm.som                  = 0;
  vm.convention           = {};
  vm.data                 = {};
  vm.model                = {};
  vm.initialiseConvention = initialiseConvention;
  vm.pay                  = pay;
  vm.setCashAccount       = setCashAccount;
  vm.check                = check;

  // Startup
  cache.fetch('selectedItem').then(load);
  startup();

  // Functions
  function load (selectedItem) {
    if (!selectedItem) { return ; }
    vm.selectedItem = selectedItem;
  }

  function startup() {
    vm.project = SessionService.project;
    vm.enterprise = SessionService.enterprise;
    dependencies.accounts.query.where = ['account.enterprise_id=' + vm.project.enterprise_id];
    validate.process(dependencies)
    .then(init)
    .catch(handleError);
  }

  function init (model) {
    vm.model = model;
  }

  function ready (model) {
    vm.som = 0;
    vm.overviews = model.situations.data.filter(function (situation){
      if (situation.balance > 0)  {
        vm.som += situation.balance;
      }
      return situation.balance>0;
    });
    vm.som = precision.round(vm.som,2);
    vm.noEmpty = true;
  }

  function initialiseConvention (selectedConvention) {
    if(!selectedConvention) {
      messenger.error($translate.instant('CONVENTION.NO_CONVENTION'));
    }
    vm.selectedConvention = selectedConvention;
    dependencies.situations = { query : '/ledgers/debitor_group/' + vm.selectedConvention.uuid};
    validate.process(dependencies, ['situations'])
    .then(ready)
    .catch(handleError);
  }

  function pay () {
    var record = {
      uuid            : uuid(),
      project_id      : vm.project.id,
      type            : 'E',
      date            : util.sqlDate(new Date()),
      currency_id     : vm.selectedItem.currency_id,
      account_id      : vm.selectedConvention.account_id,
      cost            : vm.data.payment,
      user_id         : SessionService.user.id,
      description     : ['COVP', vm.selectedConvention.name, util.sqlDate(new Date())].join('/'),
      cash_box_id     : vm.cashbox_id,
      origin_id       : vm.model.pcash_module.data[0].id
    };

    writePay(record)
    .then(writeItem)
    .then(postToJournal)
    .then(handleSucces)
    .catch(handleError);
  }

  function writePay(record){
    return connect.post('primary_cash', [record]);
  }

  function writeItem (result){
    var pcashItems = getPcashItems(vm.data.payment, result);
    return $q.all(pcashItems.map(function (pcash_item){
      return connect.post('primary_cash_item', [pcash_item]);
    }));
  }

  function postToJournal (resu) {
    record_uuid = resu[0].config.data.data[0].primary_cash_uuid;
    return connect.fetch('/journal/pcash_convention/' + record_uuid);
  }

  function getPcashItems(max_amount, result) {
    var items = [];
    var cost_received = max_amount;

    if (vm.selectedItem.currency_id === vm.enterprise.currency_id) {
      for (var i = 0; i < vm.overviews.length; i += 1){
        cost_received -= vm.overviews[i].balance;
        if(cost_received >= 0) {
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : vm.overviews[i].balance, credit : 0, inv_po_id : vm.overviews[i].inv_po_id, document_uuid : vm.overviews[i].inv_po_id });
        }else{
          cost_received+=vm.overviews[i].balance;
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : cost_received, credit : 0, inv_po_id : vm.overviews[i].inv_po_id, document_uuid : vm.overviews[i].inv_po_id});
          break;
        }
      }
    } else {
      var rate = vm.model.exchange_rate.data[0];
      for (var j = 0; j < vm.overviews.length; j += 1){
        var value = (vm.overviews[j].balance * rate.rate);
        cost_received -= value;
        if (cost_received >= 0) {
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : value, credit : 0, inv_po_id : vm.overviews[j].inv_po_id, document_uuid : vm.overviews[j].inv_po_id});
        } else {
          cost_received += value;
          items.push({uuid : uuid(), primary_cash_uuid : result.config.data.data[0].uuid, debit : cost_received, credit : 0, inv_po_id : vm.overviews[j].inv_po_id, document_uuid : vm.overviews[j].inv_po_id});
          break;
        }
      }
    }
    return items;
  }

  function setCashAccount(cashAccount) {
    if (cashAccount) {
      vm.selectedItem = cashAccount;
      cache.put('selectedItem', cashAccount);
    }
  }

  function check () {
    if (vm.data.payment) {
      if(vm.selectedItem.currency_id !== vm.enterprise.currency_id) {
        var rate = vm.model.exchange_rate.data[0];
        return vm.data.payment < vm.selectedItem.min_monentary_unit || vm.data.payment > vm.som * rate.rate;
      }else{
        return vm.data.payment < vm.selectedItem.min_monentary_unit || vm.data.payment > vm.som;
      }
    } else {
       return true;
    }
  }

  function handleSucces() {
    vm.selectedConvention = {};
    vm.data = {};
    vm.noEmpty = false;
    if (record_uuid !== -1) {
      $location.path('/invoice/pcash_convention/' + record_uuid);
    }
  }

  function handleError(err) {
    messenger.error(err, true);
  }

}
