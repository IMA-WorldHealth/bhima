angular.module('bhima.controllers')
.controller('receipt.service_distribution', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.service_distribution = {
      query : {
        identifier : 'uuid',
        tables : {
          consumption : { columns : ['quantity', 'date', 'uuid', 'unit_price'] },
          consumption_service : { columns : ['service_id'] },
          service : {columns : ['name']},
          stock : {columns : ['tracking_number', 'lot_number']},
          inventory : {columns : ['text', 'purchase_price']},
          project : { columns : ['abbr'] }
        },
        join : [
          'consumption.uuid=consumption_service.consumption_uuid',
          'consumption_service.service_id=service.id',
          'consumption.tracking_number=stock.tracking_number',
          'stock.inventory_uuid=inventory.uuid',
          'service.project_id=project.id'
        ]
      }
    };

    function buildInvoice (res) {
      model.service_distribution = res.service_distribution.data;
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.service_distribution.query.where = ['consumption.document_id=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
