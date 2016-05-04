angular.module('bhima.controllers')
.controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$uibModalInstance', 'DebtorService',
  'CreditorService', 'data'
];

/**
 * Find Reference Modal Controller
 *
 * This controller provides bindings for the find references modal.
 */
function FindReferenceModalController(Instance, Debtor, Creditor, Data) {
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
  vm.gridOptions.columnDefs = [
    { field : 'reference', displayName : 'Reference'},
    { field : 'description', displayName : 'Description'},
    { field : 'balance', displayName : 'Balance'},
  ];
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
    return;
  }

  function selectDocType(type) {
    vm.documentTypeLabel = vm.documentType[type].label;
    vm.documentType[type].action();
    vm.documentTypeSelected = true;
  }

  function refresh() {
    vm.result = {};
    vm.documentTypeSelected = false;
  }

  function submit() {
    Instance.close(vm.result);
  }

  function cancel() {
    Instance.dismiss('cancel');
  }

  function startup() {
    vm.selectedEntity = Data.entity || {};
  }

}
