angular.module('bhima.controllers')
  .controller('StockFindPatientModalController', StockFindPatientModalController);

StockFindPatientModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'NotifyService', 'data', 'AppCache',
  'BarcodeService',
];

function StockFindPatientModalController(Instance, Patients, Notify, Data, AppCache, Barcodes) {
  const vm = this;
  const cache = new AppCache('StockFindPatient');

  cache.joinInvoice = cache.joinInvoice || 0;

  // join invoice as default behavior
  vm.joinInvoice = cache.joinInvoice;

  // global
  vm.selected = {};

  // bind methods
  vm.setPatient = setPatient;
  vm.setInvoice = setInvoice;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.openBarcodeScanner = openBarcodeScanner;

  if (Data.entity_uuid) {
    Patients.read(Data.entity_uuid)
      .then(patient => {
        setPatient(patient);
      })
      .catch(err => {
        if (err.statusCode === 404) {
          setPatient({});
        } else {
          Notify.handleError(err);
        }
      });
  }


  // set patient
  function setPatient(patient) {
    vm.selected = patient;
  }

  function setInvoice(invoice) {
    vm.selected.invoice = invoice;
  }

  // submit
  function submit() {
    Instance.close(vm.selected);
  }

  // cancel
  function cancel() {
    Instance.close();
  }

  /**
   * @function openBarcodeScanner
   *
   * @description
   * Opens the barcode scanner component and receives the invoice from the
   * modal.  Sets both the patient and the invoice based on the scan.
   */
  function openBarcodeScanner() {
    let invoice;

    Barcodes.modal()
      .then(record => {
        invoice = record;
        return Patients.read(record.patient_uuid);
      })
      .then(patient => {
        setPatient(patient);
        setInvoice(invoice);

        vm.i18nValues = { reference : invoice.reference };
      })
      .catch(angular.noop);
  }

}
