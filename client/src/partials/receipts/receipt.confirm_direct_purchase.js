angular.module('bhima.controllers')
.controller('receipt.confirm_direct_purchase', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}}, service_txt = 'confirm_purchase';

    dependencies.confirmDirectPurchase = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'project_id', 'purchase_date', 'note'] },
          supplier : { columns : ['name'] },
          user : { columns : ['first', 'last'] }
        },
        join : [
          'purchase.creditor_uuid=supplier.creditor_uuid',
          'purchase.emitter_id=user.id']
      }
    };

    dependencies.directPurchases = {
      query : {
        identifier : 'uuid',
        tables : {
          'purchase' : {
            columns : ['uuid', 'reference', 'project_id', 'cost', 'currency_id', 'creditor_uuid', 'purchase_date', 'note', 'purchaser_id', 'is_direct']
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

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          posting_journal : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']}
        },
        distinct : true,
        join : ['posting_journal.origin_id=transaction_type.id'],
        where : ['transaction_type.service_txt=' + service_txt]
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          general_ledger : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']}
        },
        distinct : true,
        join : ['general_ledger.origin_id=transaction_type.id'],
        where : ['transaction_type.service_txt=' + service_txt]
      }
    };

    function buildInvoice (res) {
      if(res.getTransaction.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      } else if (res.getGeneraLedger.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      }

      model.directPurchase = res.directPurchases.data;
      model.confirmDirectPurchase = res.confirmDirectPurchase.data.pop();
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {

        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.confirmDirectPurchase.query.where =  ['purchase.uuid=' + values.invoiceId];
        dependencies.directPurchases.query.where =  ['purchase.uuid=' + values.invoiceId];
        dependencies.getTransaction.query.where = ['posting_journal.inv_po_id=' + values.invoiceId , 'AND', 'transaction_type.service_txt=' + service_txt];
        dependencies.getGeneraLedger.query.where = ['general_ledger.inv_po_id=' + values.invoiceId , 'AND', 'transaction_type.service_txt=' + service_txt];        

        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
