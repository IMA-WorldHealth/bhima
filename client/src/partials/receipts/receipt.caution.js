angular.module('bhima.controllers')
.controller('receipt.caution', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, 
        model = $scope.model = {common : {}}, 
        utility = $scope.utility = {},
        session = $scope.session = {};

    dependencies.caution = {
      required: true,
      query:  {
        tables: {
          cash: { columns: ['reference', 'cost', 'deb_cred_uuid', 'project_id', 'currency_id', 'date'] },
          patient : {columns : ['first_name', 'last_name', 'middle_name', 'current_location_id']},
          project : {columns : ['abbr'] }
        },
        join : ['cash.deb_cred_uuid=patient.debitor_uuid', 'cash.project_id=project.id'],
      }
    };

    dependencies.currency = {
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    function buildInvoice (res) {
      model.caution = res.caution.data[0];
      model.currency = res.currency;
      model.selectedCurrency = model.currency.get(model.caution.currency_id);
      session.currency_id = model.selectedCurrency.id;
      session.cost = model.caution.cost;
    }

    function updateCurrency (currency_id) {
      session.currency_id = currency_id;
      
      if (model.caution.currency_id !== currency_id) {
        /* FIXME Fc require exceptional processing */
        if (model.caution.currency_id === 1) {
          session.cost = utility.convert(model.caution.cost, model.caution.currency_id);
        } else {
          session.cost = utility.doConvert(session.cost, currency_id);
        }
      } else {
        session.cost = model.caution.cost;
      }
    }

    $scope.updateCurrency = updateCurrency;

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {
        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        utility.convert = values.convert;
        utility.doConvert = values.doConvert;
        dependencies.caution.query.where = ['cash.uuid=' + values.invoiceId];
        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
