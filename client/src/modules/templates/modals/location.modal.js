angular.module('bhima.controllers')
  .controller('LocationModalController', LocationModalController);

LocationModalController.$inject = [
  '$rootScope', 'LocationService', '$uibModalInstance', 'appcache', 'Store', 'NotifyService',
  'LocationConfigurationService',
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
function LocationModalController($rootScope, Locations, Instance, AppCache, Store, Notify, LocationConfiguration) {
  const vm = this;

  /** caches the current view in local storage */
  const cache = AppCache('bh-location-select-modal');

  vm.choice = {};
  vm.stateParams = {};
  vm.parentElement = {};
  vm.locations = {};
  vm.is_highest = 1;

  if (vm.parentId) {
    vm.is_highest = 0;
    vm.locations.parent = vm.parentId;

    LocationConfiguration.read(vm.parentId)
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

  /**
   * This is not the best way to do states, but for such a complex component,
   * this seems to be the clearest way forward.  The view is cached in AppCache
   * under the cacheKey.
   *
   * The onEnter() functions are run to clear dependent models, so the input
   * doesn't have an [object Object] written in it.
   *
   * @const
   */

  /**
   * messages to be displayed in the <select> options.  Normally, these are
   * "Select a X", but in case there is no data, a no data message is displayed.
   */
  vm.messages = {
    country : Locations.messages.country,
    province : Locations.messages.province,
    sector : Locations.messages.sector,
  };

  /** cancels the create location modal */
  vm.dismiss = Instance.dismiss;

  /** sets the modal location view/state */
  //vm.setView = setView;

  /** bind listener */
  // vm.loadProvinces = loadProvinces;
  // vm.loadSectors = loadSectors;
  vm.submit = submit;

  // loadView(cache.view);

  /** load previous/default view */
  // function loadView(key = vm.views.country.cacheKey) {
  //   setView(key);
  // }

  // loadCountries();

  // function loadCountries() {
  //   Locations.countries()
  //     .then((countries) => {

  //       // bind the countries to the view for <select>ion
  //       vm.countries = countries;

  //       // make sure that we are showing the proper message to the client
  //       vm.messages.country = (countries.length > 0)
  //         ? Locations.messages.country
  //         : Locations.messages.empty;
  //     });
  // }

  /** loads provinces based on the selected country */
  // function loadProvinces() {

  //   // make sure we do not make unnecessary HTTP requests
  //   if (!vm.country || !vm.country.uuid) { return; }

  //   Locations.provinces({ country : vm.country.uuid })
  //     .then((provinces) => {

  //       // bind the provinces to the view for <select>ion
  //       vm.provinces = provinces;

  //       // make sure that we show the correct message in the <select> option
  //       vm.messages.province = (provinces.length > 0)
  //         ? Locations.messages.province
  //         : Locations.messages.empty;
  //     });
  // }

  /** loads sectors based on the selected province */
  // function loadSectors() {

  //   // make sure we do not make unnecessary HTTP requests
  //   if (!vm.province || !vm.province.uuid) { return; }

  //   Locations.sectors({ province : vm.province.uuid })
  //     .then((sectors) => {

  //       // bind the sectors to the view for <select>ion
  //       vm.sectors = sectors;

  //       // make sure that we show the correct message in the <select> option
  //       vm.messages.sector = (sectors.length > 0)
  //         ? Locations.messages.sector
  //         : Locations.messages.empty;
  //     });
  // }

  /** show/hide different values */
  // function setView(key) {

  //   // cache the value for later
  //   cache.view = key;

  //   // set the current view to the selected one.
  //   vm.view = vm.views[key];

  //   // run the onEnter() function.
  //   vm.view.onEnter();
  // }

  /** creates a new location based on the selections made. */
  function submit(form) {

    vm.hasNoChange = form.$submitted && form.$pristine && !vm.isCreating;
    if (form.$invalid) { return null; }
    if (form.$pristine) { return null; }

    return LocationConfiguration.create(vm.locations)
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
