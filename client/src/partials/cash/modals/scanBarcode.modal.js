angular.module('bhima.controllers')
  .controller('CashBarcodeScannerModalController', CashBarController);

CashBarController.$inject = [
  '$state', 'CashboxService', 'NotifyService', 'BarcodeService', 'PatientService',
  'bhConstants', '$uibModalInstance', '$timeout', 'PatientInvoiceService', '$rootScope'
];

/**
 * @module cash/modals/CashBarController
 *
 * @description
 * This controller is responsible for scanning barcodes and the
 * configuring the CashForm with the barcode
*/
function CashBarController($state, Cashboxes, Notify, Barcodes, Patients, bhConstants, Instance, $timeout, Invoices, RS) {
  var vm = this;
  var id = $state.params.id;

  var MODAL_CLOSE_TIMEOUT = 0;

  vm.triggerBarcodeRead = triggerBarcodeRead;
  vm.dismiss = dismiss;

  vm.loading = true;

  vm.INITIALIZED = 'initialized';
  vm.LOADING = 'loading';
  vm.READ_ERROR = 'read-error';
  vm.READ_SUCCESS = 'found';

  // the first step is initialized
  vm.step = vm.INITIALIZED;

  // determine if the input was a valid barcode
  function isValidBarcode(input) {
    return input.length >= bhConstants.barcodes.LENGTH;
  }

  function dismiss() {
    Instance.dismiss();
  }

  // TODO(@jniles) potentially this should tell you if you are trying to read a
  // cash payment instead of an invoice
  // TODO(@jniles) potentially this should clear the input when the barcode
  // is greater in length than 10.
  // TODO(@jniles) this should be a component
  function triggerBarcodeRead() {
    if (isValidBarcode(vm.barcode)) {
      searchForBarcode(vm.barcode);
    } else {
      vm.step = vm.READ_ERROR;
    }
  }

  // send an HTTP request based on the barcode to get the invoice in question,
  // then load the patient information in the background
  function searchForBarcode(barcode) {

    // set the loading step
    vm.step = vm.LOADING;

    Barcodes.search(barcode)
      .then(function (invoice) {
        vm.invoice = invoice;
        return Invoices.balance(invoice.uuid);
      })
      .then(function (balance) {
        vm.balance = balance;
        return Patients.search({ debtor_uuid : vm.invoice.debtor_uuid });
      })
      .then(function (patients) {

        // de-structure search array
        var patient = patients[0];

        vm.patient = patient;

        // emit the
        RS.$broadcast('cash:configure', {
          invoices: [vm.balance],
          patient: vm.patient,
          description : vm.invoice.serviceName
        });

        vm.step = vm.READ_SUCCESS;

        // close the modal after a timeout
        $timeout(function () {
          Instance.close();
        }, MODAL_CLOSE_TIMEOUT, false);
      })
      .catch(function (error) {
        vm.step = vm.READ_ERROR;
      })
      .finally(function () {
        toggleFlickerAnimation();
      });
  }

  function toggleFlickerAnimation() {
    vm.flicker = !vm.flicker;
  }

  // fired on state startup
  function startup() {
    vm.flicker = true;

    Cashboxes.read(id)
      .then(function (cashbox) {
        vm.cashbox = cashbox;
      })
      .catch(Notify.handleError);
  }

  startup();
}
