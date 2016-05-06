angular.module('bhima.controllers')
.controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$scope', '$uibModalInstance', 'DebtorService',
  'CreditorService', 'VoucherService', 'JournalFilteringService', 'data'
];

/**
 * Find Reference Modal Controller
 *
 * This controller provides bindings for the find references modal.
 */
function FindReferenceModalController($scope, Instance, Debtor, Creditor, Voucher, Filtering, Data) {
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
  }

  vm.selectDocType = selectDocType;
  vm.submit  = submit;
  vm.cancel  = cancel;
  vm.refresh = refresh;

  /** Grid configurations */
  vm.gridOptions = {};

  /** grid utilities */
  var filtering  = new Filtering(vm.gridOptions);

  vm.gridOptions.multiSelect     = false;
  vm.gridOptions.enableFiltering = true;
  vm.gridOptions.onRegisterApi   = onRegisterApi;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    /** @fixme: use of $scope is not optimal */
    vm.gridApi.selection.on.rowSelectionChanged($scope, rowSelectionCallback);
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
    Debtor.invoices(vm.selectedEntity.uuid)
    .then(function (list) {
      vm.gridOptions.data = list;
    });
  }

  function referenceCashPayment() {
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
      /**
       * @fixme: the voucher API returns two lines
       * for credit and debit with the same amount; and we need
       * only one line with the amount
       * we choose to discare the credit line
       */
      var data = [];
      list.forEach(function (item) {
        if (item.credit === 0) {
          data.push({
            uuid          : item.uuid,
            reference     : item.reference,
            date          : item.date,
            description   : item.description,
            amount        : item.amount,
            document_uuid : item.document_uuid
          });
        }
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
    vm.selectedEntity = Data.entity || {};
  }

}
