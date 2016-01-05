angular.module('bhima.controllers')
.controller('PrimaryCashIncomeTransferController', PrimaryCashIncomeTransferController);

PrimaryCashIncomeTransferController.$inject = [
  'connect', 'validate', 'util', 'uuid',
  '$routeParams', '$location', 'SessionService', 'exchange'
];

function PrimaryCashIncomeTransferController (connect, validate, util, uuid, $routeParams, $location, SessionService, exchange) {
  var vm = this,
      dependencies = {},
      data = vm.data = {},
      pcash_box_id = $routeParams.cashbox_id;

  dependencies.primary_cash_module = {
    required : true,
    query : {
      tables : {
        'primary_cash_module' : { columns : ['id'] }
      },
      where : ['primary_cash_module.text=transfert']
    }
  };

  dependencies.projects = {
    required : true,
    query : {
      tables : {
        'project' : {
          columns : ['id', 'name', 'abbr', 'enterprise_id']
        }
      }
    }
  };

  dependencies.cash_boxes = {
    required : true,
    query : {
      tables : {
        'cash_box' : {
          columns : ['id', 'text', 'project_id', 'is_auxillary', 'is_bank']
        },
      }
    }
  };

  dependencies.cash_box_account_currencies = {
    required : true,
    query : {
      tables : {
        'cash_box_account_currency' : { columns : ['id', 'currency_id', 'account_id', 'cash_box_id'] }
      }
    }
  };

  dependencies.currencies = {
    required : true,
    query : {
      tables : {
        'currency' : {
          columns : ['id', 'symbol'] // TODO: including min_monentary unit and then doing validation checks based on it.
        }
      }
    }
  };

  // Expose to view
  vm.labelCurrency = labelCurrency;
  vm.submit        = submit;

  // Startup
  startup();

  // Functions
  function startup() {
    if (!exchange.hasDailyRate()) { $location.path('/primary_cash/'); }
    data.project_id = SessionService.project.id;
    validate.process(dependencies)
    .then(initialise);
  }

  function initialise(model) {
    angular.extend(vm, model);
  }

  function labelCurrency (id) {
    if (!angular.isDefined(id)) { return '...'; }
    return vm.currencies.get(id).symbol || '{ERR}';
  }

  function getAccount(currencyId, cashBoxId) {
    var accountId;
    vm.cash_box_account_currencies.data.forEach(function (box) {
      if (box.currency_id === Number(currencyId) && box.cash_box_id === Number(cashBoxId) ) {
        accountId = box.account_id;
      }
    });
    return accountId;
  }

  function submit() {
    var pcash, item, accountId, date = util.sqlDate();

    accountId = getAccount(data.currency_id, data.cash_box_id);
    if (!accountId) { throw 'NO ACCOUNT'; }

    pcash = {
      uuid        : uuid(),
      project_id  : data.project_id,
      type        : 'E',
      date        : date,
      currency_id : data.currency_id,
      account_id  : accountId,
      cost        : data.value,
      description : 'Caisse Transfert/' + date,
      cash_box_id : pcash_box_id,
      origin_id   : vm.primary_cash_module.data[0].id,
      user_id     : SessionService.user.id
    };

    connect.post('primary_cash', pcash)
    .then(function () {
      item = {
        uuid              : uuid(),
        primary_cash_uuid : pcash.uuid,
        debit             : data.value,
        document_uuid     : pcash.uuid,
        credit            : 0
      };
      return connect.post('primary_cash_item', item);
    })
    .then(function () {
      // post to journal
      return connect.fetch('/journal/transfert/' + pcash.uuid);
    })
    .then(function () {
      // navigate to invoice
      $location.path('/invoice/pcash_transfert/' + pcash.uuid);
    })
    .catch(error);
  }

  function error(err) {
    throw err;
  }

}
