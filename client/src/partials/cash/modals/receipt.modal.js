angular.module('bhima.controllers')
.controller('CashReceiptModalController', CashReceiptModalController);

CashReceiptModalController.$inject = [
  'uuid', 'patientUuid', '$uibModalInstance', 'CashService', 'ProjectService',
  'EnterpriseService', '$q', 'CashboxService', 'UserService', 'ExchangeRateService',
  'PatientService', 'CurrencyService'
];

/**
 * @module cash/modals/CashReceiptModalController
 *
 * @description This controller is responsible for displaying a receipt for a
 * cash payment made from the auxillary cash box.
 */
function CashReceiptModalController(uuid, patientUuid, ModalInstance, Cash, Projects, Enterprises, $q, Cashboxes, Users, Exchange, Patients, Currencies) {
  var vm = this;

  // bind close modal method
  vm.cancel = ModalInstance.dismiss;
  vm.isEnterpriseCurrency = isEnterpriseCurrency;
  vm.fmtCurrency = fmtCurrency;

  // bind data
  vm.loading = false;

  /** generic error handler temporarily */
  function handler(error) {
    vm.error = error;
  }

  /** fired to start up the receipt module */
  function startup() {

    // turn loading indicator on
    toggleLoadingIndicator();

    Cash.read(uuid).then(function (receipt) {

      // bind the receipt
      vm.receipt = receipt;

      return $q.all([

        // read in the cashboxes to tell the user where it was created
        Cashboxes.read(receipt.cashbox_id),

        // find out who created the sale
        Users.read(receipt.user_id),

        // get the project information
        Projects.read(receipt.project_id),

        // load in the patient details
        Patients.detail(patientUuid),

        // ensure the exchange rates are loaded
        Exchange.read(),

        // ensure that currencies are loaded
        Currencies.read()
      ]);
    })
    .then(function (promises) {

      // destruct the promises
      vm.cashbox = promises[0];
      vm.user    = promises[1];
      vm.project = promises[2];
      vm.patient = promises[3];

      // format a patient name nicely
      vm.patient.label = fmtPatient(vm.patient);

      // for display purposes, convert the value to the payment value
      vm.receipt.total =
        Exchange.convertFromEnterpriseCurrency(vm.receipt.currency_id, vm.receipt.date, vm.receipt.amount);

      // calculate the exchange rate on the date of sale
      vm.rate =
        Exchange.getExchangeRate(vm.receipt.currency_id, vm.receipt.date);

      // still need to get the enterprise information
      return Enterprises.read(vm.project.enterprise_id);
    })
    .then(function (enterprise) {
      vm.enterprise = enterprise;
    })
    .catch(handler)
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  /** toggle loading indicator on and off */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /** this is to make HTML more readable */
  function isEnterpriseCurrency(id) {
    return vm.enterprise && vm.enterprise.currency_id === id;
  }

  /** formats a patient's name nicely */
  function fmtPatient(patient) {
    return [patient.first_name, patient.middle_name, patient.last_name].join(' ');
  }

  function fmtCurrency(id) {
    return angular.isDefined(id) ?
      Currencies.format(id) :
      '';
  }

  // starts up the module
  startup();
}
