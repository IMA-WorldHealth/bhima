angular.module('bhima.controllers')
.controller('CashDiscardController', CashDiscardController);

CashDiscardController.$inject = [
  '$scope', '$routeParams', '$filter', '$location', 'validate',
  'connect', 'messenger', 'uuid', 'appstate'
];

function CashDiscardController($scope, $routeParams, $filter, $location,  validate, connect, messenger, uuid, appstate) {
  var receiptId = $routeParams.receiptId, dependencies = {};

  dependencies.cash = {
    required: true,
    query: {
      tables: {
        cash: {
          columns: ['uuid', 'cost', 'deb_cred_uuid', 'date', 'description', 'project_id', 'currency_id', 'is_caution']
        },
        patient: {
          columns: ['first_name', 'last_name']
        }
      },
      join: ['cash.deb_Cred_uuid=patient.debitor_uuid']
    }
  };

  dependencies.cashItem = {
    required: true,
    query: {
      tables: {
        sale_item: {
          columns: ['uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'debit', 'credit']
        },
        inventory: {
          columns: ['code', 'text']
        },
        cash_item : {
          columns: ['allocated_cost']
        }
      },
      join : ['cash_item.invoice_uuid = sale_item.sale_uuid', 'sale_item.inventory_uuid=inventory.uuid']
    }
  };

  dependencies.cashDiscard = {
    query: {
      tables: {
        cash_discard : { columns: ['uuid', 'posted'] }
      }
    }
  };

  appstate.register('project', function (project) {
    $scope.project = project;
    if (receiptId) { handleCautionCase(); }
  });

  function handleCautionCase() {
    dependencies.cash.query.where = ['cash.uuid=' + receiptId];
    return validate.process(dependencies, ['cash']).then(buildCashQuery);
  }

  function buildCashQuery(model) {
    if (model.cash.data[0].is_caution) {
      $scope.isCaution = true;
      
      dependencies.cashItem = {
        required: true,
        query: {
          tables: {
            cash_item : {
              columns: ['allocated_cost']
            }
          }
        }
      };

    } else {
      $scope.isCaution = false;
      dependencies.cashItem.query.join = ['cash_item.invoice_uuid = sale_item.sale_uuid', 'sale_item.inventory_uuid=inventory.uuid'];
    }
    dependencies.cashItem.query.where = ['cash_item.cash_uuid=' + receiptId];
    dependencies.cashDiscard.query.where = ['cash_discard.cash_uuid=' + receiptId];
    return validate.refresh(dependencies).then(cashDiscard);
  }

  function cashDiscard(model) {
    $scope.model = model;
    $scope.cash = $scope.model.cash.data[0];
    $scope.cashDiscard = packageCashDiscard();
  }

  function packageCashDiscard() {
    var defaultDescription = $scope.project.abbr + '_CAISSE_ANNULATION_PAIE/' + $scope.cash.uuid + '/ from ' + $filter('date')($scope.cash.date);
    var noteObject = {
      uuid : uuid(),
      project_id: $scope.cash.project_id,
      cost: $scope.cash.cost,
      debitor_uuid: $scope.cash.deb_cred_uuid,
      cash_uuid: $scope.cash.uuid,
      date: new Date().toISOString().slice(0, 10), // format as mysql date
      description: defaultDescription
    };
    return noteObject;
  }

  function submitNote(noteObject) {

    noteObject.reference = 1;
    if ($scope.model.cashDiscard.data.length >= 1) { return messenger.danger('Receipt has already been reversed'); }
    connect.post('cash_discard', [noteObject])
    .then(function () {
      return connect.fetch('journal/cash_discard/' + noteObject.uuid);
    })
    .then(function () {
      $location.path('/invoice/cash_discard/' + noteObject.uuid);
    });

    validate.refresh(dependencies, ['cashDiscard']);
  }

  $scope.submitNote = submitNote;
}
