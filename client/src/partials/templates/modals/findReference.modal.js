angular.module('bhima.controllers')
.controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$uibModalInstance', 'DebtorService',
  'CreditorService', 'VoucherService', 'GridFilteringService', 'entity'
];

/**
 * Find Reference Modal Controller
 *
 * This controller provides bindings for the find references modal.
 * @todo Implement the Patient Invoices Data list for the references
 * @todo Implement the Cash Payment Data list for the references
 * @todo Implement the link to the document for exactitude of the reference
 */
function FindReferenceModalController(Instance, Debtor, Creditor, Voucher, Filtering, Entity) {
  var vm = this;

  vm.result = {};

  vm.documentType = {
    'patient_invoice' : {
      label : 'VOUCHERS.COMPLEX.PATIENT_INVOICE',
      action : referencePatientInvoice
    },
    'cash_payment' : {
      label : 'VOUCHERS.COMPLEX.CASH_PAYMENT',
      action : referenceCashPayment
    },
    'voucher' : {
      label : 'VOUCHERS.COMPLEX.VOUCHER',
      action : referenceVoucher
    }
  };

  vm.selectDocType = selectDocType;
  vm.submit  = submit;
  vm.cancel  = cancel;
  vm.refresh = refresh;

  /** Grid configurations */
  vm.gridOptions = {};

  /** grid utilities */
  var filtering  = new Filtering(vm.gridOptions);

  vm.gridOptions.multiSelect     = false;
  vm.gridOptions.onRegisterApi   = onRegisterApi;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  function rowSelectionCallback(row) {
    vm.selectedRow = row.entity;
  }
  /** End grid configuration */

  // startup the modal
  startup();

  Debtor.read()
  .then(function (list) {
    vm.debtorList = list;
  });

  Creditor.read()
  .then(function (list) {
    vm.creditorList = list;
  });

  function referencePatientInvoice() {
    /**
    * @fixme the balance value is not correct for the document references
    * The correct value is the amount of the invoice in the receipt
    */
    return;
  }

  function referenceCashPayment() {
    /**
    * @fixme the balance value is not correct for the document references
    * The correct value is the amount of the invoice in the receipt
    */
    return;
  }

  function referenceVoucher() {
    Voucher.read()
    .then(function (list) {
      vm.gridOptions.columnDefs  = [
        { field : 'reference', displayName : 'Reference'},
        { field : 'description', displayName : 'Description'},
        { field : 'amount', displayName : 'Amount'},
        {
          field : 'date',
          displayName : 'Date',
          cellFilter : 'date:"mediumDate"',
          filter : { condition : filtering.byDate }
        },
      ];

      // format data for the grid
      var data = list.map(function (item) {
        return {
          uuid          : item.uuid,
          reference     : item.reference,
          date          : item.date,
          description   : item.description,
          amount        : item.amount,
          document_uuid : item.document_uuid
        };
      });
      vm.gridOptions.data = data;
    });
  }

  function selectDocType(type) {
    vm.documentTypeLabel = vm.documentType[type].label;
    vm.documentType[type].action();
    vm.documentTypeSelected = true;
  }

  function refresh() {
    vm.documentTypeSelected = false;
  }

  function submit() {
    Instance.close(vm.selectedRow);
  }

  function cancel() {
    Instance.dismiss('cancel');
  }

  function startup() {
    vm.selectedEntity = Entity || {};
  }

}
