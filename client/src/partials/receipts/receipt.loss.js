angular.module('bhima.controllers')
.controller('receipt.loss', InvoiceLossController);

InvoiceLossController.$inject = [
  '$scope', 'validate', 'appstate', 'messenger'
];

function InvoiceLossController($scope, validate, appstate, messenger) {
  var dependencies = {}, model = $scope.model = {common : {}};

  dependencies.loss = {
    query : {
      identifier : 'uuid',
        tables : {
          consumption : { columns : ['quantity', 'date', 'uuid', 'document_id'] },
          consumption_loss : { columns : ['consumption_uuid'] },
          stock : {columns : ['tracking_number', 'lot_number', 'entry_date']},
          inventory : {columns : ['text', 'purchase_price']},
          purchase : { columns : ['purchase_date']},
          purchase_item : { columns : ['unit_price']}
        },
        join : [
          'consumption.uuid=consumption_loss.consumption_uuid',
          'consumption.tracking_number=stock.tracking_number',
          'stock.inventory_uuid=inventory.uuid',
          'stock.purchase_order_uuid=purchase.uuid',
          'purchase.uuid=purchase_item.purchase_uuid',
          'purchase_item.inventory_uuid=inventory.uuid'
        ]
    }
  };

  function buildInvoice (res) {
    model.loss = res.loss.data;
  }

  appstate.register('receipts.commonData', function (commonData) {
    commonData.then(function (values) {
      model.common.location = values.location.data.pop();
      model.common.InvoiceId = values.invoiceId;
      model.common.enterprise = values.enterprise.data.pop();
      dependencies.loss.query.where =  ['consumption.document_id=' + values.invoiceId];
      validate.process(dependencies)
      .then(buildInvoice)
      .catch(function (err){
        messenger.danger('error', err);
      });
    });
  });
}
