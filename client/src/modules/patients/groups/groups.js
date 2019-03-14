angular.module('bhima.controllers')
  .controller('PatientGroupController', PatientGroupController);

PatientGroupController.$inject = [
  'PatientGroupService', 'PriceListService', 'SessionService', 'ModalService',
  'util', 'NotifyService', 'SubsidyService', 'InvoicingFeesService',
];

/**
 *  Patient Group Controller
 *
 *  This controller creates and updates patient groups in the application.  A
 *  Patient Group is a medical classification for patients with common
 *  properties.  For example, HIV patients, pregnant women, children under five.
 *
 *  A patient group might have an associated price list, to allow groups of
 *  patients to have different price lists due to their medical state.
 *
 *  @constructor
 */
function PatientGroupController(
  PatientGroups, PriceLists, Session, ModalService, util, Notify, Subsidies,
  InvoicingFees
) {
  const vm = this;

  vm.length100 = util.length100;
  vm.maxLength = util.maxTextLength;

  // by default, set loading to false.
  vm.loading = false;

  // This method is responsible of initializing data
  function startup() {
    // make the loading state into true, while loading data
    toggleLoadingIndicator();

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

        // load all patient groups
        return loadPatientGroups();
      })
      .then(patientGroups => {
        vm.groups = patientGroups;
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // this method is responsible to propose a GUI to user for creation
  function create() {
    // init the patient group
    vm.patientGroup = {};

    // switch the view to create
    vm.view = 'create';
  }

  // this function is responsible of submitting the patient group to the server for creation
  function submit(form) {
    // if the form is not valid do nothing
    if (form.$invalid) { return 0; }

    const creation = (vm.view === 'create');
    const patientGroup = angular.copy(vm.patientGroup);

    /** @todo - discuss if this should happen on the server */
    patientGroup.enterprise_id = Session.enterprise.id;

    const promise = (creation)
      ? PatientGroups.create(patientGroup)
      : PatientGroups.update(patientGroup.uuid, patientGroup);

    return promise
      .then(() => {
        return loadPatientGroups();
      })
      .then((groups) => {
        vm.groups = groups;
        vm.view = 'default';
      })
      .catch(Notify.handleError);
  }


  // this method is changing the view for the update
  function update(uuid) {
    // switch view to update
    vm.view = 'update';

    PatientGroups.read(uuid)
      .then((data) => {
        data.invoicingFees = data.invoicingFees.map(fee => fee.id);
        data.subsidies = data.subsidies.map(subsidy => subsidy.id);
        vm.patientGroup = data;
      })
      .catch(Notify.handleError);
  }

  // this function clears the selected form
  function cancel() {
    vm.view = 'default';
  }

  // this function is responsible of removing a patient group
  function remove() {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        // if the user cancels, return immediately.
        if (!bool) { return; }

        PatientGroups.delete(vm.patientGroup.uuid)
          .then(() => {
            vm.view = 'default';
            return loadPatientGroups();
          })
          .then((groups) => {
            vm.groups = groups;
          })
          .catch(Notify.handleError);
      });
  }

  // this method is load the list of patient group
  function loadPatientGroups() {
    return PatientGroups.read(null, { detailed : 1 });
  }

  startup();

  // exposing interfaces to the view
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.remove = remove;
  vm.cancel = cancel;
}
