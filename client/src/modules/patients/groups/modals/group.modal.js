angular.module('bhima.controllers')
  .controller('PatientGroupModalController', PatientGroupModalController);

PatientGroupModalController.$inject = [
  '$state', 'PatientGroupService', 'NotifyService', 'SessionService',
  'InvoicingFeesService', 'SubsidyService', 'util', 'PriceListService',
];

function PatientGroupModalController(
  $state, PatientGroups, Notify, Session, InvoicingFees,
  Subsidies, util, PriceList
) {
  const vm = this;

  vm.length100 = util.length100;
  vm.maxLength = util.maxTextLength;

  vm.groupUuid = $state.params.uuid;
  vm.isCreating = !!($state.params.creating);

  function startup() {

    PriceList.read()
      .then(prices => {
        vm.priceLists = prices;
      })
      .catch(Notify.handleError);

    InvoicingFees.read()
      .then(invoicingFees => {
        vm.invoicingFees = invoicingFees;
      })
      .catch(Notify.handleError);

    Subsidies.read()
      .then(subsidies => {
        vm.subsidies = subsidies;
      })
      .catch(Notify.handleError);

    if (!vm.isCreating) {
      PatientGroups.read(vm.groupUuid)
        .then((data) => {
          data.invoicingFees = data.invoicingFees.map(fee => fee.id);
          data.subsidies = data.subsidies.map(subsidy => subsidy.id);
          vm.patientGroup = data;
        })
        .catch(Notify.handleError);
    } else {
      vm.patientGroup = { invoicingFees : [], subsidies : [] };
    }
  }

  // exposed methods
  vm.submit = submit;

  // submit the data to the server from all two forms (update, create)
  function submit(patientGroupForm) {
    if (patientGroupForm.$invalid) {
      return;
    }

    if (patientGroupForm.$pristine) {
      cancel();
      return;
    }

    const patientGroup = angular.copy(vm.patientGroup);
    patientGroup.enterprise_id = Session.enterprise.id;

    const promise = (vm.isCreating)
      ? PatientGroups.create(patientGroup)
      : PatientGroups.update(patientGroup.uuid, patientGroup);

    promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'PATIENT_GROUP.CREATED' : 'PATIENT_GROUP.UPDATED';
        Notify.success(translateKey);
        $state.go('patientGroups', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('patientGroups');
  }

  startup();
}
