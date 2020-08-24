angular.module('bhima.controllers')
  .controller('LocationModalController', LocationModalController);

LocationModalController.$inject = [
  '$rootScope', 'LocationService', '$uibModalInstance', 'appcache', 'Store', 'NotifyService',
];

/**
 * "Add a Location" Modal
 *
 * This modal can be injected into any page, and is useful for creating
 * locations on the fly.  The user is asked to choose from countries,
 * provinces, and sectors as needed to create a new location.  It shares many
 * similarities with the bhLocationSelect component.
 *
 * @class LocationModalController
 */
function LocationModalController($rootScope, Locations, Instance, AppCache, Store, Notify) {
  const vm = this;

  vm.choice = {};
  vm.stateParams = {};
  vm.parentElement = {};
  vm.locations = {};
  vm.is_highest = 1;

  if (vm.parentId) {
    vm.is_highest = 0;
    vm.locations.parent = vm.parentId;

    Locations.read(vm.parentId)
      .then(parent => {
        vm.parentElement = parent;
      })
      .catch(Notify.handleError);
  }

  vm.onSelectLocationTypeSelect = onSelectLocationTypeSelect;
  vm.onDefineLocationChange = onDefineLocationChange;
  vm.onSelectParent = onSelectParent;

  function onSelectLocationTypeSelect(type) {
    vm.locations.location_type_id = type.id;
    vm.is_highest = vm.stateParams.parentId ? 0 : 1;
  }

  function onDefineLocationChange(value) {
    vm.is_highest = value;
  }

  function onSelectParent(locationParent) {
    vm.locations.parent = locationParent.id;
    vm.locations.parent_uuid = locationParent.uuid;
  }

  // use to simply refresh the mdoal state
  vm.registerMultiple = false;

  /** cancels the create location modal */
  vm.dismiss = Instance.dismiss;

  vm.submit = submit;

  /** creates a new location based on the selections made. */
  function submit(form) {

    vm.hasNoChange = form.$submitted && form.$pristine && !vm.isCreating;
    if (form.$invalid) { return null; }
    if (form.$pristine) { return null; }

    return Locations.create(vm.locations)
      .then(data => {

        // notify success
        Notify.success('FORM.INFO.CREATE_SUCCESS');
        $rootScope.$broadcast('LOCATIONS_UPDATED', data);

        if (vm.registerMultiple) {
          vm.locations = {};
          vm.is_highest = true;
          return 0;
        }

        return Instance.close(data);
      })
      .catch(Notify.handleError);
  }
}
