angular.module('bhima.controllers')
  .controller('CashBarcodeScannerModalController', CashBarController);

CashBarController.$inject = [
  '$state', 'CashboxService', 'NotifyService', 'PatientService',
  'bhConstants', '$uibModalInstance', '$timeout', 'PatientInvoiceService', '$rootScope',
];

/**
 * @module cash/modals/CashBarController
 *
 * @description
 * This controller is responsible for scanning barcodes and the
 * configuring the CashForm with the barcode
*/
function CashBarController($state, Cashboxes, Notify, Patients, bhConstants, Instance, $timeout, Invoices, RS) {
  const vm = this;
  const { id } = $state.params;

  const MODAL_CLOSE_TIMEOUT = 0;

  vm.dismiss = () => Instance.dismiss();

  vm.onScanCallback = onScanCallback;

  // send an HTTP request based on the barcode to get the invoice in question,
  // then load the patient information in the background
  function onScanCallback(invoice) {
    let invoiceBalance;

    return Invoices.balance(invoice.uuid)
      .then(balance => {
        invoiceBalance = balance;
        return Patients.read(null, { debtor_uuid : invoice.debtor_uuid });
      })
      .then(patients => {
        const [patient] = patients;

        // emit the configuration event
        RS.$broadcast('cash:configure', {
          patient,
          invoices : [invoiceBalance],
          description : invoice.serviceName,
        });

        // close the modal after a timeout
        $timeout(() => {
          Instance.close();
        }, MODAL_CLOSE_TIMEOUT, false);
      })
      .catch(Notify.handleError);
  }

  // fired on state startup
  function startup() {
    Cashboxes.read(id)
      .then(cashbox => {
        vm.cashbox = cashbox;
      })
      .catch(Notify.handleError);
  }

  startup();
}
