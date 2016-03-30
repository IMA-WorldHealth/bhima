angular.module('bhima.controllers')
.controller('receipt.transfer', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.transfer = {
      required: true,
      query:  {
        tables: {
          primary_cash: { columns: [ 'uuid', 'reference','cost', 'project_id', 'currency_id', 'date'] },
          primary_cash_item : { columns : ['document_uuid'] },
          user : {columns : ['first', 'last']},
          account : {columns : ['label']}
        },
        join : ['primary_cash.user_id=user.id', 'primary_cash.account_id=account.id', 'primary_cash.uuid=primary_cash_item.primary_cash_uuid']
      }
    };

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          primary_cash : { columns : ['uuid'] },
          primary_cash_item : { columns : ['document_uuid'] },
          posting_journal : { columns : ['trans_id'] }
        },
        distinct : true,
        join : ['primary_cash.uuid=primary_cash_item.primary_cash_uuid','posting_journal.inv_po_id=primary_cash_item.document_uuid']
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          primary_cash : { columns : ['uuid'] },
          primary_cash_item : { columns : ['document_uuid'] },
          general_ledger : { columns : ['trans_id'] }
        },
        distinct : true,
        join : ['primary_cash.uuid=primary_cash_item.primary_cash_uuid','general_ledger.inv_po_id=primary_cash_item.document_uuid']
      }
    };

    function buildInvoice (res) {
      if(res.getTransaction.data.length){
        $scope.trans_id = res.getTransaction.data.map(function(item){
          return item.trans_id;
        }).join(';');
      } else {
        $scope.trans_id = res.getGeneraLedger.data.map(function (item){
          return item.trans_id;
        }).join(';');
      }


      model.transfer = res.transfer.data.pop();
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.enterprise = values.enterprise.data.pop();
        model.common.InvoiceId = values.invoiceId;
        dependencies.transfer.query.where = ['primary_cash.uuid=' + values.invoiceId];
        dependencies.getTransaction.query.where = ['primary_cash.uuid=' + values.invoiceId];
        dependencies.getGeneraLedger.query.where = ['primary_cash.uuid=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
