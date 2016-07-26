angular.module('bhima.controllers')
.controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$uibModalInstance', 'DebtorService', 'CreditorService',
  'VoucherService', 'GridFilteringService', 'entity',
  'PatientInvoiceService'
];

/**
 * Find Reference Modal Controller
 *
 * This controller provides bindings for the find references modal.
 * @todo Implement the Cash Payment Data list for the references
 */
function FindReferenceModalController(Instance, Debtor, Creditor, Voucher, Filtering, Entity, Invoices) {
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

  /* ======================= Grid configurations ============================ */
  vm.gridOptions = {};

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
  /* ======================= End Grid configurations ======================== */

  // startup the modal
  startup();

  function referencePatientInvoice() {
    Invoices.read()
    .then(function (list) {
      var costTemplate =
        '<div class="ui-grid-cell-contents text-right">' +
          '{{ row.entity.cost | currency: grid.appScope.enterprise.currency_id }}' +
        '</div>';

      vm.gridOptions.columnDefs = [
        { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
        { field : 'date', cellFilter:'date', filter : { condition : filtering.byDate }, displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate' },
        { field : 'patientNames', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
        { field : 'cost', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate', cellTemplate: costTemplate },
        { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
        { field : 'createdBy', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' }
      ];

      vm.gridOptions.data = list;
    });
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
      var amountTemplate =
        '<div class="ui-grid-cell-contents text-right">' +
          '{{ row.entity.amount | currency: grid.appScope.enterprise.currency_id }}' +
        '</div>';

      vm.gridOptions.columnDefs  = [
        { field : 'reference', displayName : 'Reference'},
        { field : 'description', displayName : 'Description'},
        { field : 'amount', displayName : 'Amount', cellTemplate: amountTemplate },
        { field : 'date', displayName : 'Date', cellFilter : 'date:"mediumDate"', filter : { condition : filtering.byDate } },
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

    Debtor.read()
    .then(function (list) {
      vm.debtorList = list;
    });

    Creditor.read()
    .then(function (list) {
      vm.creditorList = list;
    });
  }

}
