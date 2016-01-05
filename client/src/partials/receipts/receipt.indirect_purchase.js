angular.module('bhima.controllers')
.controller('receipt.indirect_purchase', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  'SessionService',
  function ($scope, validate, appstate, messenger, Session) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.indirectPurchase = {
        query : {
          identifier : 'uuid',
          tables : {
            purchase : { columns : ['uuid', 'reference', 'cost', 'creditor_uuid', 'purchaser_id', 'project_id', 'purchase_date', 'note'] },
            employee : { columns : ['code', 'name', 'prenom', 'postnom'] }
          },
          join : ['purchase.purchaser_id=employee.id']
        }
    };

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['paid_uuid'] },
          primary_cash : { columns : ['uuid'] },
          primary_cash_item : { columns : ['document_uuid'] },
          posting_journal : { columns : ['trans_id'] }
        },
        distinct : true,
        join : [
          'purchase.paid_uuid=primary_cash.uuid',
          'primary_cash.uuid=primary_cash_item.primary_cash_uuid',
          'posting_journal.inv_po_id=primary_cash_item.document_uuid'
          ]
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['paid_uuid'] },
          primary_cash : { columns : ['uuid'] },
          primary_cash_item : { columns : ['document_uuid'] },
          general_ledger : { columns : ['trans_id'] }
        },
        distinct : true,
        join : [
          'purchase.paid_uuid=primary_cash.uuid',
          'primary_cash.uuid=primary_cash_item.primary_cash_uuid',
          'general_ledger.inv_po_id=primary_cash_item.document_uuid'
          ]
      }
    };


    function buildInvoice (res) {
      if(res.getTransaction.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      } else {
        $scope.trans_id = res.getGeneraLedger.data[0].trans_id;
      }

      model.indirectPurchase = res.indirectPurchase.data.pop();
      model.userInfo = Session.user;
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.indirectPurchase.query.where =  ['purchase.uuid=' + values.invoiceId];
        dependencies.getTransaction.query.where = ['purchase.uuid=' + values.invoiceId];
        dependencies.getGeneraLedger.query.where = ['purchase.uuid=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
