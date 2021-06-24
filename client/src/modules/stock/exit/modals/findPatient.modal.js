angular.module('bhima.controllers')
  .controller('StockFindPatientModalController', StockFindPatientModalController);

StockFindPatientModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'NotifyService', 'data', 'AppCache',
  'BarcodeService', 'DebtorService', 'PatientInvoiceService', 'SessionService',
];

function StockFindPatientModalController(Instance, Patients, Notify, Data, AppCache, Barcodes, Debtors,
  PatientInvoice, Session) {
  const vm = this;
  const cache = new AppCache('StockFindPatient');

  cache.joinInvoice = cache.joinInvoice || 0;

  // join invoice as default behavior
  vm.joinInvoice = cache.joinInvoice;

  // global
  vm.selected = {};
  vm.patientInvoices = [];

  // bind methods
  vm.setPatient = setPatient;
  vm.setInvoice = setInvoice;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.openBarcodeScanner = openBarcodeScanner;
  vm.getLastInvoice = getLastInvoice;
  vm.invoiceSelected = false;
  vm.enterprise = Session.enterprise;

  vm.findDetailInvoice = findDetailInvoice;

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
    vm.joinInvoice = false;
    vm.invoiceSelected = false;
    vm.selected = patient;
  }

  function getLastInvoice() {
    // load debtor invoices
    Debtors.invoices(vm.selected.debtor_uuid, { descLimit5 : 1 })
      .then((invoices) => {
        vm.patientInvoices = invoices;
      })
      .catch(Notify.handleError);
  }

  function findDetailInvoice(invoice) {
    const parameters = {
      invoiceReference : invoice.reference,
      patientUuid : vm.selected.uuid,
    };

    PatientInvoice.findConsumableInvoicePatient(parameters)
      .then(consumableInvoice => {
        vm.invoice = consumableInvoice;

      })
      .catch(Notify.handleError);

  }

  function setInvoice(invoice) {
    vm.invoice = invoice;
    vm.invoiceSelected = true;
  }

  // submit
  function submit() {
    vm.selected.invoice = vm.invoice;
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

        // we need to wait for the bh-find-invoice component to call the setInvoice()
        // since the invoice details have to be formatted in a particular way.
        vm.joinInvoice = 1;
        vm.scannedInvoice = invoice;
      })
      .catch(angular.noop);
  }

}
