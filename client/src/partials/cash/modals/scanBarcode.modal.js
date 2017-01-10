angular.module('bhima.controllers')
  .controller('CashBarcodeScannerModalController', CashBarController);

CashBarController.$inject = [
  '$state', 'CashboxService', 'NotifyService', 'BarcodeService', 'PatientService', 'bhConstants', '$uibModalInstance'
];

/**
 * @module cash/modals/CashBarController
 *
 * @description
 * This controller is responsible for scanning barcodes and then configuring the CashForm with the barcode
*/
function CashBarController($state, Cashboxes, Notify, Barcodes, Patients, bhConstants, Instance) {
  var vm = this;
  var id = $state.params.id;

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

  function triggerBarcodeRead() {

    console.log('TriggerBarcodeRead with:', vm.barcode);

    if (!isValidBarcode(vm.barcode)) {
      vm.step = vm.READ_ERROR;
    } else {
      searchForBarcode(vm.barcode);
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
        return Patients.search({ debtor_uuid : invoice.debtor_uuid });
      }).then(function (patients) {

        // de-structure search array
        var patient = patients[0];

        vm.patient = patient;

        vm.step = vm.READ_SUCCESS;
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
