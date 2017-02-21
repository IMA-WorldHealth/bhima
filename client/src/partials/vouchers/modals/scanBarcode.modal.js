angular.module('bhima.controllers')
  .controller('VoucherScanBarcodeController', VoucherScanBarcodeController);

VoucherScanBarcodeController.$inject = [
  '$state', 'NotifyService', 'BarcodeService', 'PatientService', 'DebtorGroupService',
  'bhConstants', '$uibModalInstance', '$timeout', 'PatientInvoiceService', '$rootScope',
  '$translate',
];

/**
 * @module voucher/modals/VoucherScanBarcodeController
 *
 * @description
 * This is almost a direct copy of the cash scan barcode controller with some
 * bells and whistles removed.
 *
 * @todo - refactor this whole thing into a component.
*/
function VoucherScanBarcodeController($state, Notify, Barcodes, Patients, DebtorGroups, bhConstants, Instance, $timeout, Invoices, RS, $translate) {
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

        return DebtorGroups.read(patient.debtor_group_uuid);
      })
      .then(function (group) {

        // TODO - move all data gathering to a barcode component
        var data = {
          patient : vm.patient,
          invoice : vm.invoice,
          balance : vm.balance,
          group : group
        };

        // format the data as needed before returning to the parent controller
        var fmt = barcodeDataFinalizerFn(data);

        // emit the configuration event
        RS.$broadcast('voucher:configure', fmt);

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

  // this function formats the data as needed.
  function barcodeDataFinalizerFn(data) {

    data.description = $translate.instant('VOUCHERS.TYPES.SUPPORT_PAYMENT_DESCRIPTION', {
      patientName : data.patient.display_name,
      patientReference : data.patient.reference,
      invoiceReference : data.invoice.reference
    });

    data.debit = {
      debit : data.invoice.cost,
    };

    // PRISE_EN_CHARGE
    data.type_id = bhConstants.transactionType.SUPPORT_INCOME;

    data.credit = {
      account_id : data.group.account_id,
      document : data.invoice,
      entity : { uuid : data.patient.debtor_uuid },
      credit : data.invoice.cost,
    };

    data.amount = data.invoice.cost;

    return data;
  }

  function toggleFlickerAnimation() {
    vm.flicker = !vm.flicker;
  }

  // fired on state startup
  function startup() {
    vm.flicker = true;
  }

  startup();
}
