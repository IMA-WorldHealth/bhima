angular.module('bhima.controllers')
.controller('receipt.consumption', ConsumptionReceiptController);

ConsumptionReceiptController.$inject = [
  '$scope', 'validate', 'appstate', 'messenger'
];

function ConsumptionReceiptController($scope, validate, appstate, messenger) {
  var dependencies = {}, model = $scope.model = {common : {}};

  dependencies.consumptions = {
    query : {
      tables : {
        'consumption' : {
          columns : ['uuid', 'date', 'tracking_number', 'quantity', 'depot_uuid', 'canceled']
        },
        'sale' : {
            columns : ['reference', 'cost', 'debitor_uuid', 'invoice_date']
        },
        'stock' : {
          columns : ['inventory_uuid', 'expiration_date', 'lot_number']
        },
        'inventory' : {
          columns : ['code', 'text']
        },
        'patient' : {
          columns : ['first_name', 'last_name', 'middle_name', 'dob', 'current_location_id', 'reference::ref_patient']
        },
        'debitor' : {
          columns : ['group_uuid']
        },
        'debitor_group' : {
          columns : ['name', 'account_id']
        },
        'project' : {
          columns: ['abbr::abbr_patient']
        }
      },
      join : [
        'sale.uuid=consumption.document_id',
        'stock.tracking_number=consumption.tracking_number',
        'stock.inventory_uuid=inventory.uuid',
        'sale.debitor_uuid=debitor.uuid',
        'patient.debitor_uuid=sale.debitor_uuid',
        'debitor_group.uuid=debitor.group_uuid',
        'patient.project_id=project.id'
      ]
    }
  };

  dependencies.depot = {
    query : {
      tables : {
        'depot' : {
          columns : ['reference', 'text']
        }
      }
    }
  };

  function getConsumptions (res) {
    var data_consumptions = [];
    model.consumptions = res.consumptions.data;
    data_consumptions = res.consumptions.data;

    if (!data_consumptions.length){
      data_consumptions = res.consumptions.data;
    }

    var reference = model.reference = model.consumptions[0];
    dependencies.depot.query.where = ['depot.uuid=' + reference.depot_uuid];
    model.consumptions = data_consumptions;

    // TODO - this is a hack
    model.canceled = data_consumptions[0].canceled;
    return validate.refresh(dependencies);
  }

  function getDepot (data) {
    model.depot = data.depot.data.pop();
  }

  appstate.register('receipts.commonData', function (commonData) {
    commonData.then(function (values) {
      model.common.location = values.location.data.pop();
      model.common.invoiceId = values.invoiceId;
      model.common.enterprise = values.enterprise.data.pop();
      dependencies.consumptions.query.where = ['consumption.document_id=' + values.invoiceId];
      validate.process(dependencies)
      .then(getConsumptions)
      .then(getDepot)
      .catch(function (err){
        messenger.danger('error', err);
      });
    });
  });
}
