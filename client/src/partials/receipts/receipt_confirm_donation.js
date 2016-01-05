angular.module('bhima.controllers')
.controller('receipt.confirm_donation', [
  '$scope',
  'validate',
  'appstate',
  'messenger',
  function ($scope, validate, appstate, messenger) {
    var dependencies = {}, model = $scope.model = {common : {}};

    dependencies.confirmDonations = {
      query : {
        identifier : 'uuid',
        tables : {
          donations : { columns : ['uuid', 'date'] },
          donor : { columns : ['name::name_donor'] },
          employee : { columns : ['name::name_employee', 'prenom', 'postnom'] },
          user : { columns : ['first', 'last'] }
        },
        join : [
          'donations.donor_id=donor.id',
          'donations.employee_id=employee.id',
          'donations.confirmed_by=user.id']
      }
    };

    dependencies.donations = {
      query : {
        identifier : 'uuid',
        tables : {
          'donations' : {
            columns : ['uuid', 'date']
          },
          'donation_item' : {
            columns : ['donation_uuid', 'tracking_number']
          },
          'stock' : {
            columns : ['inventory_uuid', 'quantity']
          },
          'inventory' : {
            columns : ['code', 'text']
          }
        },
        join : [
          'donations.uuid=donation_item.donation_uuid',
          'donation_item.tracking_number=stock.tracking_number',
          'inventory.uuid=stock.inventory_uuid'
        ]
      }
    };

    dependencies.getTransaction = {
      query : {
        identifier : 'uuid',
        tables : {
          posting_journal : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']}
        },
        distinct : true,
        join : ['posting_journal.origin_id=transaction_type.id']
      }
    };

    dependencies.getGeneraLedger = {
      query : {
        identifier : 'uuid',
        tables : {
          general_ledger : { columns : ['trans_id'] },
          transaction_type : {columns : ['id']}
        },
        distinct : true,
        join : ['general_ledger.origin_id=transaction_type.id']
      }
    };

    function buildInvoice (res) {
      if(res.getTransaction.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      } else if (res.getGeneraLedger.data.length){
        $scope.trans_id = res.getTransaction.data[0].trans_id;
      }

      model.donations = res.donations.data;
      model.confirmDonations = res.confirmDonations.data.pop();
    }

  	appstate.register('receipts.commonData', function (commonData) {
  		commonData.then(function (values) {

        model.common.location = values.location.data.pop();
        model.common.InvoiceId = values.invoiceId;
        model.common.enterprise = values.enterprise.data.pop();

        dependencies.confirmDonations.query.where =  ['donations.uuid=' + values.invoiceId];
        dependencies.donations.query.where =  ['donations.uuid=' + values.invoiceId];
        dependencies.getTransaction.query.where = ['posting_journal.inv_po_id=' + values.invoiceId ];
        dependencies.getGeneraLedger.query.where = ['general_ledger.inv_po_id=' + values.invoiceId ];


        validate.process(dependencies)
        .then(buildInvoice)
        .catch(function (err){
          messenger.danger('error', err);
        });
  		});
    });
  }
]);
