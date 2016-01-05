angular.module('bhima.controllers')
.controller('receipt.credit_note', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}}; 

    dependencies.creditNote = {
      required: true,
      query: {
        tables: {
          credit_note: { columns: ['uuid', 'cost', 'debitor_uuid', 'seller_id', 'sale_uuid', 'note_date', 'description'] },
          patient: { columns: ['first_name', 'last_name', 'reference'] }
        },
        join: ['credit_note.debitor_uuid=patient.debitor_uuid']
      }
    };

    function buildInvoice (res) {
      model.creditNote = res.creditNote.data.pop();
    }

    appstate.register('receipts.commonData', function (commonData) {
      commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.invoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.creditNote.query.where = ['credit_note.uuid=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
      });     
    });    
  }
]);