angular.module('bhima.controllers')
.controller('receipt.confirm_integration', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  'SessionService',
  function ($scope, validate, appstate, messenger, Session) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.stock = {
      query : {
        identifier : 'uuid',
        tables : {
          purchase : { columns : ['uuid::purchase_uuid','purchaser_id', 'purchase_date', 'emitter_id'] },
          movement : {
            columns : ['uuid', 'document_id', 'depot_entry', 'tracking_number', 'quantity', 'date']
          },
          stock : {
            columns : ['expiration_date', 'entry_date', 'lot_number', 'purchase_order_uuid']
          },
          inventory : {
            columns : ['code', 'text::inventory_text']
          },
          depot : {
            columns : ['reference', 'text']
          }
        },
        join : [
          'movement.depot_entry=depot.uuid',
          'movement.tracking_number=stock.tracking_number',
          'stock.inventory_uuid=inventory.uuid',
          'stock.purchase_order_uuid=purchase.uuid'
        ]
      }
    };

    dependencies.allUser = {
      identifier : 'id',
      query : {
        tables : {
          user : {columns : ['id', 'first', 'last']}
        }
      }
    };

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          posting_journal : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']},
          stock : {columns : ['tracking_number', 'purchase_order_uuid']},
          movement : {columns : ['document_id']}
        },
        distinct : true,
        join : [
          'posting_journal.origin_id=transaction_type.id',
          'stock.purchase_order_uuid=posting_journal.inv_po_id',
          'movement.tracking_number=stock.tracking_number'
          ]
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          general_ledger : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']},
          stock : {columns : ['tracking_number', 'purchase_order_uuid']},
          movement : {columns : ['document_id']}
        },
        distinct : true,
        join : [
          'general_ledger.origin_id=transaction_type.id',
          'stock.purchase_order_uuid=general_ledger.inv_po_id',
          'movement.tracking_number=stock.tracking_number'
          ]
      }
    };

    function buildInvoice (res) {
      if(res.getTransaction.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      } else if (res.getGeneraLedger.data.length) {
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      }

      model.stock = res.stock.data;
      $scope.idUser = Session.user.id;
      $scope.today = new Date();
      return res;
    }

    function getUsers (data) {
      var p = data.allUser.get(data.stock.data[0].emitter_id);
      var c = Session.user;
      model.integreur = p.first + ' - ' + p.last;
      model.confirmeur = c.first + ' - ' + c.last;
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {

        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();
        dependencies.stock.query.where =  ['movement.document_id=' + values.invoiceId];
        dependencies.getTransaction.query.where = ['movement.document_id=' + values.invoiceId ];
        dependencies.getGeneraLedger.query.where = ['movement.document_id=' + values.invoiceId ];

        validate.process(dependencies)
        .then(buildInvoice)
        .then(getUsers)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
