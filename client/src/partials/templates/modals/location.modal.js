angular.module('bhima.controllers')
.controller('LocationModalController', LocationModalController);

LocationModalController.$inject = [
  'LocationService', '$uibModalInstance', 'appcache'
];

/**
 * "Add a Location" Modal
 *
 * This modal can be injected into any page, and is useful for creating
 * locations on the fly.  The user is asked to choose from countires,
 * provinces, and sectors as needed to create a new location.
 */
function LocationModalController(Locations, Instance, AppCache) {
  var vm = this;

  /** caches the current view */
  var cache = new AppCache('bh-location-select-modal');

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
  vm.views = {
    country : {
      cacheKey : 'country',
      translateKey : 'LOCATION.COUNTRY',
      index : 1,
      onEnter : function onEnter() { delete vm.country; }
    },
    province : {
      cacheKey : 'province',
      translateKey : 'LOCATION.PROVINCE',
      index : 2,
      onEnter : function onEnter() { delete vm.province; }
    },
    sector : {
      cacheKey : 'sector',
      translateKey : 'LOCATION.SECTOR',
      index : 3,
      onEnter : function onEnter() { delete vm.sector; }
    },
    village : {
      cacheKey : 'village',
      translateKey : 'LOCATION.VILLAGE',
      index : 4,
      onEnter : function onEnter() { delete vm.village; }
    }
  };

  /** bind indicators */
  vm.loading = false;

  /** cancels the create location modal */
  vm.dismiss = Instance.dismiss;

  /** sets the modal location view/state */
  vm.setView = setView;

  /** bind listener */
  vm.loadProvinces = loadProvinces;
  vm.loadSectors = loadSectors;

  /** load previous/default view */
  cache.fetch('view')
  .then(function (key) {
    key = key ||  vm.views.country.cacheKey;
    setView(key);
  });

  /** load countries on startup */
  Locations.countries()
  .then(function (countries) {
    vm.countries = countries;
  });


  /** loads provinces based on the selected country */
  function loadProvinces() {
    Locations.provinces(vm.countries.uuid)
    .then(function (provinces) {
      vm.provinces = provinces;
    });
  }

  /** loads sectors based on the selected province */
  function loadSectors() {
    Locations.sectors(vm.province.uuid)
    .then(function (sectors) {
      vm.sectors = sectors;
    });
  }

  /** show/hide different values */
  function setView(key) {

    // cache the value for later
    cache.put('view', key);

    // set the current view to the selected one.
    vm.view = vm.views[key];

    // run the onEnter() function.
    vm.view.onEnter();
  }

  /** creates a new location based on the selections made. */
  function submit(invalid) {

    // reject an invalid form
    if (invalid)  { return; }

  }
}
