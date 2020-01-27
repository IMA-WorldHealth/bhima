angular.module('bhima.controllers')
  .controller('StockFindPatientModalController', StockFindPatientModalController);

StockFindPatientModalController.$inject = [
  '$uibModalInstance', 'PatientService', 'NotifyService', 'data', 'AppCache',
];

function StockFindPatientModalController(Instance, Patient, Notify, Data, AppCache) {
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

  if (Data.entity_uuid) {
    Patient.read(Data.entity_uuid)
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
}
