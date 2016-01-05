angular.module('bhima.controllers')
.controller('receipt.convention', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.convention = {
      required: true,
      query:  {
        tables: {
          primary_cash: { columns: ['reference', 'cost', 'project_id', 'currency_id', 'date'] },
          primary_cash_item : {columns : ['debit', 'credit']},
          account : {columns : ['account_txt']},
          sale       : {columns : ['note']}
        },
        join : ['primary_cash.account_id=account.id', 'primary_cash.uuid=primary_cash_item.primary_cash_uuid', 'sale.uuid=primary_cash_item.inv_po_id']
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
        $scope.trans_id = res.getTransaction.data[0].trans_id;  
      } else {
        $scope.trans_id = res.getGeneraLedger.data[0].trans_id;  
      }
      
      $scope.reference = res.convention.data[0].reference;
      model.conventions = res.convention.data;
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.convention.query.where = ['primary_cash.uuid=' + values.invoiceId];
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