angular.module('bhima.controllers')
.controller('receipt.purchase', PurchaseReceiptController);

PurchaseReceiptController.$inject = [
  '$scope', 'validate', 'appstate', 'messenger',
];

function PurchaseReceiptController($scope, validate, appstate, messenger) {
  var vm = this;
  var dependencies = {}, model = $scope.model = {common : {}};

  dependencies.indirectPurchases = {
    query : {
      identifier : 'uuid',
      tables : {
        'purchase' : {
          columns : ['uuid', 'reference', 'project_id', 'cost', 'currency_id', 'creditor_uuid', 'purchase_date', 'note', 'purchaser_id', 'is_direct', 'is_authorized', 'is_validate']
        },
        'purchase_item' : {
          columns : ['inventory_uuid', 'purchase_uuid', 'quantity', 'unit_price', 'total']
        },
        'inventory' : {
          columns : ['code', 'text']
        },
        'creditor' : {
          columns : ['group_uuid']
        },
        'supplier' : {
          columns : ['email', 'phone']
        },
        'employee' : {
          columns : ['prenom', 'name', 'postnom', 'creditor_uuid']
        }
      },
      join : [
        'purchase.uuid=purchase_item.purchase_uuid',
        'purchase_item.inventory_uuid=inventory.uuid',
        'purchase.creditor_uuid=creditor.uuid',
        'creditor.uuid=supplier.creditor_uuid',
        'purchase.purchaser_id=employee.id'
      ]
    }
  };

  dependencies.directPurchases = {
    query : {
      identifier : 'uuid',
      tables : {
        'purchase' : {
          columns : ['uuid', 'reference', 'project_id', 'cost', 'currency_id', 'creditor_uuid', 'purchase_date', 'note', 'purchaser_id', 'is_direct', 'is_validate', 'is_authorized']
        },
        'purchase_item' : {
          columns : ['inventory_uuid', 'purchase_uuid', 'quantity', 'unit_price', 'total']
        },
        'inventory' : {
          columns : ['code', 'text']
        },
        'creditor' : {
          columns : ['group_uuid']
        },
        'supplier' : {
          columns : ['email', 'phone']
        }
      },
      join : [
        'purchase.uuid=purchase_item.purchase_uuid',
        'purchase_item.inventory_uuid=inventory.uuid',
        'purchase.creditor_uuid=creditor.uuid',
        'creditor.uuid=supplier.creditor_uuid'
      ]
    }
  };

  dependencies.supplier = {
    query : {
      tables : {
        'purchase' : {
          columns : ['creditor_uuid']
        },
        'creditor' : {
          columns : ['text']
        },
        'supplier' : {
          columns : ['name', 'email', 'phone']
        }
      },
      join : [
        'purchase.creditor_uuid=creditor.uuid',
        'creditor.uuid=supplier.creditor_uuid'
      ]
    }
  };

  dependencies.header = {
    query : {
      tables : {
        'purchase' : {
          columns : ['uuid', 'receiver_id', 'emitter_id']
        },
        'employee' : {
          columns : ['prenom', 'name', 'postnom', 'creditor_uuid']
        },
        'user' : {
          columns : ['first', 'last']
        }
      },
      join : [
        'purchase.receiver_id=employee.id',
        'purchase.emitter_id=user.id'
      ]
    }
  };

  function buildInvoice (res) {
    model.common.header = res.header.data;
    model.common.purchases = (res.indirectPurchases.data.length) ? res.indirectPurchases.data : res.directPurchases.data;
    model.common.supplier = res.supplier.data;
  }

  appstate.register('receipts.commonData', function (commonData) {
    commonData.then(function (values) {
      model.common.location = values.location.data.pop();
      model.common.enterprise = values.enterprise.data.pop();

      dependencies.indirectPurchases.query.where =  ['purchase_item.purchase_uuid=' + values.invoiceId];
      dependencies.directPurchases.query.where =  ['purchase_item.purchase_uuid=' + values.invoiceId,'AND','purchase.is_direct=1'];
      dependencies.supplier.query.where =  ['purchase.uuid=' + values.invoiceId];
      dependencies.header.query.where =  ['purchase.uuid=' + values.invoiceId];

      validate.process(dependencies)
      .then(buildInvoice)
      .catch(function (err){
        messenger.danger('error', err);
      });
    });
  });
}
