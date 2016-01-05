angular.module('bhima.controllers')
.controller('PurchaseOrderCashController', PurchaseOrderCashController);

PurchaseOrderCashController.$inject = [
  '$routeParams', '$translate', '$http', 'messenger', 'validate', 'SessionService',
  'connect', '$location', 'util', 'exchange'
];

function PurchaseOrderCashController ($routeParams, $translate, $http, messenger, validate, SessionService, connect, $location, util, exchange) {
  var vm = this,
      dependencies = {},
      session = vm.session = {},
      cashboxReference = $routeParams.cashbox,
      cashbox, currency_id = 2; // FIXME

  // TODO Don't download complete purchase orders
  dependencies.purchase = {
    query : {
      identifier : 'uuid',
      tables : {
        purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note'] },
        employee : { columns : ['name'] },
        project : { columns : ['abbr'] }
      },
      join : ['purchase.project_id=project.id', 'purchase.purchaser_id=employee.id'],
      where : ['purchase.paid=0','AND','purchase.is_donation=0','AND', 'purchase.is_authorized=1']
    }
  };

  dependencies.cashbox = {
    query : {
      tables : {
        cash_box : { columns : ['id', 'text', 'project_id', 'is_auxillary'] },
        cash_box_account_currency : { columns : ['account_id'] },
      },
      join : ['cash_box_account_currency.cash_box_id=cash_box.id'],
      where : ['cash_box.id=' + cashboxReference, 'AND', 'cash_box_account_currency.currency_id=' + currency_id]
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
      where : ['primary_cash_module.text=Purchase']
    }
  };

  // Expose to view
  vm.confirmPurchase = confirmPurchase;
  vm.payPurchase     = payPurchase;

  // Startup
  (function startup() {
    if (!exchange.hasDailyRate()) { $location.path('/primary_cash/'); }

    if (!cashboxReference) {
      return messenger.info($translate.instant('CASH_PURCHASE.CASHBOX_ASSIGN_ERROR'));
    }

    vm.project = SessionService.project;
    validate.process(dependencies).then(initialise);
  })();

  function initialise(model) {
    angular.extend(vm, model);
    cashbox = vm.cashbox = model.cashbox.data[0];
  }

  function confirmPurchase(purchaseId) {
    session.selected = vm.purchase.get(purchaseId);
  }

  function payPurchase() {
    dependencies.employee = {
      query : {
        tables : {
          employee : {
            columns : ['creditor_uuid']
          },
          creditor : {
            columns : ['group_uuid']
          },
          creditor_group : {
            columns : ['account_id']
          }
        },
        join : [
          'employee.creditor_uuid=creditor.uuid',
          'creditor.group_uuid=creditor_group.uuid'
        ],
        where : ['employee.id=' + session.selected.purchaser_id]
      }
    };

    validate.process(dependencies, ['employee']).then(submitPayment);
  }

  function submitPayment(model) {
    var creditorId = model.employee.data[0].creditor_uuid,
        creditorAccount = model.employee.data[0].account_id;

    var request = {
      details         : {
        project_id    : vm.project.id,
        type          : 'S',
        date          : new Date(),
        deb_cred_uuid : creditorId,
        deb_cred_type : 'C',
        currency_id   : SessionService.enterprise.currency_id,
        cash_box_id   : cashbox.id,
        account_id    : creditorAccount,
        cost          : session.selected.cost,
        description   : 'PP/' + session.selected.uuid + '/',
        origin_id     : model.pcash_module.data[0].id
      },
      transaction : [
        {
          inv_po_id : session.selected.uuid,
          debit : session.selected.cost,
          credit : 0,
          document_uuid : session.selected.uuid
        }
      ]
    };

    $http.post('purchase', request)
    .then(paymentSuccess)
    .then(generateDocument)
    .catch(handleError);
  }

  function paymentSuccess(result) {
    var purchase = {
      uuid : session.selected.uuid,
      paid : 1,
      paid_uuid : result.data.purchaseId
    };
    return connect.put('purchase', [purchase], ['uuid']);
  }

  function generateDocument (res){
      $location.path('/invoice/indirect_purchase/' + session.selected.uuid);
  }

  function handleError(error) {
    throw error;
  }

  function resetSelected () {
    delete session.selected;
  }

}
