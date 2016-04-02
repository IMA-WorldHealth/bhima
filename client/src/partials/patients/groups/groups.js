angular.module('bhima.controllers')
.controller('PatientGroupController', PatientGroupController);

PatientGroupController.$inject = [
  'PatientGroupService', 'PriceListService', 'SessionService', '$window'
];

function PatientGroupController (PatientGroups, PriceLists, Session, $window) {
  var vm = this;

  // by default, set loading to false.
  vm.loading = false;

  // This method is responsible of initializing data
  function startup() {

    // make the loading state into true, while loading data
    toggleLoadingIndicator();

    // fetching all price list
    PriceLists.read()
    .then(function (priceLists) {

      // attaching the price list to the view
      vm.priceLists = priceLists;

      // load all patient groups
      return loadPatientGroups();
    })
    .then(function (patientGroups) {

      vm.groups = patientGroups;

      // turn off loading indicator
      toggleLoadingIndicator();
    });
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
    if (form.$invalid) { return ; }

    var creation = (vm.view === 'create');
    var patientGroup = angular.copy(vm.patientGroup);

    /** @todo - discuss if this should happen on the server */
    patientGroup.enterprise_id = Session.enterprise.id;

    var promise = (creation) ?
      PatientGroups.create(patientGroup) :
      PatientGroups.update(patientGroup.uuid, patientGroup);

    return promise
      .then(function () {
        return loadPatientGroups();
      })
      .then(function (groups) {
        vm.selectedId = null;
        vm.groups = groups;
        vm.view = creation ? 'create' : 'update';
      })
      .catch(handler);
  }

  // this function is handling error from $http server
  function handler(error) {
    throw error;
  }

  // this method is changing the view for the update
  function update(uuid) {

    // switch view to update
    vm.view = 'update';

    // keep id selected
    /** @todo - do we actually need this?  It seems like we could just use
     * vm.patientGroup.uuid...
     */
    vm.selectedId = uuid;

    PatientGroups.read(uuid)
    .then(function (data) {
      vm.patientGroup = data;
    });
  }

  // this function is responsible of removing a patient group
  function remove() {
    var bool =
      $window.confirm('Are you sure you want to delete this patient group?');

    console.log('vm.patientGroup:', vm.patientGroup);

    // if the user cancels, return immediately.
    if (!bool) { return; }

    PatientGroups.remove(vm.selectedId)
    .then(function (message) {
      vm.view = 'default';
      return loadPatientGroups();
    })
    .then(function (groups) {
      vm.groups = groups;
    })
    .catch(handler);
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
}
