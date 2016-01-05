angular.module('bhima.controllers')
.controller('receipt.cash_discard', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}}; 

    dependencies.cash_discard = {
      required: true,
      query: {
        tables: {
          cash_discard : { columns: ['reference', 'uuid', 'cost', 'debitor_uuid', 'date', 'description'] },
          patient      : { columns: ['first_name', 'last_name', 'reference'] }
        },
        join: ['cash_discard.debitor_uuid=patient.debitor_uuid']
      }
    };

    function buildInvoice (res) {
      model.cash_discard = res.cash_discard.data.pop();
    }

    appstate.register('receipts.commonData', function (commonData) {
      commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.invoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.cash_discard.query.where = ['cash_discard.uuid=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
      });     
    });    
  }
]);