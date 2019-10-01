angular.module('bhima.controllers')
  .controller('GroupCreateUpdateContoller', GroupCreateUpdateContoller);

GroupCreateUpdateContoller.$inject = [
  'data', '$state', 'RolesService',
  'NotifyService', '$uibModalInstance',
  'SubsidyService', 'InvoicingFeesService',
  'PriceListService', 'util',
  'PatientGroupService', 'SessionService',
];

function GroupCreateUpdateContoller(data, $state, RolesService, Notify,
  Instance, Subsidies, InvoicingFees, PriceLists, util, PatientGroup, Session) {
  const vm = this;
  vm.loading = false;
  vm.close = Instance.close;
  vm.submit = submit;

  vm.patientGroup = { invoicingFees : [], subsidies : [] };
  vm.isCreate = !data.uuid;
  vm.action = vm.isCreate ? 'FORM.LABELS.CREATE' : 'FORM.LABELS.UPDATE';

  vm.length100 = util.length100;
  vm.maxLength = util.maxTextLength;

  init();

  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    vm.patientGroup.enterprise_id = Session.enterprise.id;
    const operation = vm.isCreate
      ? PatientGroup.create(vm.patientGroup)
      : PatientGroup.update(data.uuid, vm.patientGroup);

    return operation
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  function init() {
    InvoicingFees.read()
      .then(invoicingFees => {
        vm.invoicingFees = invoicingFees;
      });

    Subsidies.read()
      .then(subsidies => {
        vm.subsidies = subsidies;
      });
    // fetching all price list
    PriceLists.read()
      .then(priceLists => {
        // attaching the price list to the view
        vm.priceLists = priceLists;
      });

    if (!vm.isCreate) {
      PatientGroup.read(data.uuid).then(group => {
        group.invoicingFees = group.invoicingFees.map(fee => fee.id);
        group.subsidies = group.subsidies.map(subsidy => subsidy.id);
        vm.patientGroup = group;
      });
    }
  }

}
