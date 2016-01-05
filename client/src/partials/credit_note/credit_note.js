//TODO Ensure sale exists (validation test implementation required)
angular.module('bhima.controllers')
.controller('CreditNoteController', CreditNoteController);

CreditNoteController.$inject = [
  '$scope', '$routeParams', '$filter', '$location', 'validate', 'connect', 'messenger', 'uuid', 'exchange', 'SessionService'
];

function CreditNoteController($scope, $routeParams, $filter, $location,  validate, connect, messenger, uuid, exchange, Session) {
  var vm = this;  // TODO complete controller as syntax migration

  var invoiceId = $routeParams.invoiceId,
      dependencies = {};

  $scope.enterprise = Session.enterprise;
  $scope.project = Session.project;

  dependencies.sale = {
    required: true,
    query: {
      tables: {
        sale: {
          columns: ['uuid', 'cost', 'debitor_uuid', 'invoice_date', 'note', 'project_id']
        },
        patient: {
          columns: ['first_name', 'last_name']
        }
      },
      join: ['sale.debitor_uuid=patient.debitor_uuid']
    }
  };

  dependencies.saleItem = {
    required: true,
    query: {
      tables: {
        sale_item: {
          columns: ['uuid', 'inventory_uuid', 'quantity', 'transaction_price', 'debit', 'credit']
        },
        inventory: {
          columns: ['code', 'text']
        }
      },
      join: ['sale_item.inventory_uuid=inventory.uuid']
    }
  };

  dependencies.creditNote = {
    query: {
      tables: {
        'credit_note' : { columns: ['uuid', 'posted'] }
      }
    }
  };

  dependencies.cashDiscard = {
    query: {
      tables: {
        'cash_item'    : { columns: ['uuid', 'cash_uuid', 'invoice_uuid'] },
        'cash'         : { columns: ['currency_id'] },
        'cash_discard' : { columns: ['uuid::cash_discard_uuid', 'cost'] }
      },
      join: ['cash_item.cash_uuid=cash_discard.cash_uuid', 'cash.uuid=cash_item.cash_uuid']
    }
  };

  dependencies.consumptionItem = {
    query: {
      tables: {
        consumption: {
          columns: ['uuid', 'document_id']
        }
      },
      where : ['consumption.cancelled<>1']
    }
  };

  dependencies.cashItem = {
   query: {
     tables: {
       cash_item: {
         columns: ['uuid', 'invoice_uuid', 'allocated_cost']
       },
       cash: {
         columns: ['currency_id']
       }
     },
     join: ['cash.uuid=cash_item.cash_uuid']
   }
  };

  // startup the module, if we have an invoice id.
  if (invoiceId) { buildSaleQuery(); }

  function buildSaleQuery() {
    dependencies.sale.query.where = ['sale.uuid=' + invoiceId];
    dependencies.saleItem.query.where = ['sale_item.sale_uuid=' + invoiceId];
    dependencies.creditNote.query.where = ['credit_note.sale_uuid=' + invoiceId];
    dependencies.cashDiscard.query.where = ['cash_item.invoice_uuid=' + invoiceId];
    dependencies.consumptionItem.query.where = ['consumption.document_id=' + invoiceId];
    dependencies.cashItem.query.where = ['cash_item.invoice_uuid=' + invoiceId];
    return validate.process(dependencies).then(creditNote);
  }

  function creditNote(model) {
    $scope.model = model;

    $scope.nb_discard = model.cashDiscard.data.length;

    $scope.sale = $scope.model.sale.data[0];

    $scope.creditNote = packageCreditNote();

    var sumItem = $scope.sumItem = 0,
        sumDiscard = $scope.sumDiscard = 0;

    if ($scope.model.cashItem.data) {

      var cashItem = $scope.cashItem = $scope.model.cashItem.data;

      cashItem.forEach(function (item) {
        if ($scope.enterprise.currency_id !== item.currency_id) {
          item.allocated_cost /= exchange.rate(item.allocated_cost, item.currency_id,new Date());
        }
        $scope.sumItem += item.allocated_cost;
      });
    }

    if ($scope.model.cashDiscard.data) {
      var cashDiscard = $scope.cashDiscard = $scope.model.cashDiscard.data;
      cashDiscard.forEach(function (item) {
        if ($scope.enterprise.currency_id !== item.currency_id) {
          item.cost /= exchange.rate(item.cost, item.currency_id,new Date());
        }
        $scope.sumDiscard += item.cost;
      });
    }
    $scope.sumItem -= $scope.sumDiscard;
  }

  function packageCreditNote() {
    var defaultDescription = $scope.project.abbr + '_VENTE_ANNULATION_VENTE' + $scope.sale.uuid + ' from ' + $filter('date')($scope.sale.invoice_date);
    var noteObject = {
      uuid : uuid(),
      project_id: $scope.sale.project_id,
      cost: $scope.sale.cost,
      debitor_uuid: $scope.sale.debitor_uuid,
      sale_uuid: $scope.sale.uuid,
      note_date: new Date().toISOString().slice(0, 10), // format as mysql date
      description: defaultDescription
    };
    return noteObject;
  }

  function submitNote(noteObject) {
    //TODO Test object before submitting to server
    //TODO ?Check there are no credit notes for this transaction and warn user

    noteObject.reference = 1;

    // FIXME Should these cascade?  return connect.fetch()?
    if ($scope.model.creditNote.data.length >= 1) { return messenger.danger('Invoice has already been reversed with credit'); }
    connect.post('credit_note', [noteObject])
    .then(function () {
      connect.fetch('journal/credit_note/' + noteObject.uuid);
    })
    .then(function () {
      connect.fetch('journal/cancel_support/' + noteObject.sale_uuid);
    })
    .then(function () {
      $location.path('/invoice/credit/' + noteObject.uuid);
    });

    validate.refresh(dependencies, ['creditNote']);
  }

  $scope.submitNote = submitNote;
}
