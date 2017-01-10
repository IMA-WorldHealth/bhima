angular.module('bhima.controllers')
  .controller('CashBarcodeScannerModalController', CashBarController);

CashBarController.$inject = [
  '$state', 'CashboxService', 'NotifyService', 'BarcodeService', 'PatientService'
];

/**
 * @module cash/modals/CashBarController
 *
 * @description
 * This controller is responsible for scanning barcodes and then configuring the CashForm with the barcode
*/
function CashBarController($state, Cashboxes, Notify, Barcodes, Patients) {
  var vm = this;
  var id = $state.params.id;

  vm.triggerBarcodeRead = triggerBarcodeRead;

  vm.loading = true;

  vm.INITIALIZED = 'initialized';
  vm.LOADING = 'loading';
  vm.READ_ERROR = 'read-error';
  vm.READ_SUCCESS = 'found';

  // the first step is initialized
  vm.step = vm.INITILIZED;

  // determine if the input was a valid barcode
  function isValidBarcode(input) {
    return false;
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

        // destructure search array
        var patient = patients[0];

        vm.patient = patient;

        // signal
        vm.step = vm.READ_SUCCESS;
      })
      .catch(function (error) {
        vm.step = vm.READ_ERROR;
      });
  }

  // fired on state startup
  function startup() {

    Cashboxes.read(id)
      .then(function (cashbox) {
        vm.cashbox = cashbox;
      })
      .catch(Notify.handleError);
  }

  startup();
}
