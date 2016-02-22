angular.module('bhima.controllers')
.controller('LocationModalController', LocationModalController);

LocationModalController.$inject = [
  'LocationService', '$uibModalInstance'
];

/**
 * "Add a Location" Modal
 *
 * This modal can be injected into any page, and is useful for creating
 * locations on the fly.  The user is asked to choose from countires,
 * provinces, and sectors as needed to create a new location.
 */
function LocationModalController(Locations, Instance) {
  var vm = this;

  /** bind indicators */
  vm.loading = false;

  /** cancels the create location modal */
  vm.dismiss = Instance.dismiss;

  /** sets the modal location state */
  vm.state = state;

  /** default visibility */
  vm.visibility = 0;

  /** bind listener */
  vm.loadProvinces = loadProvinces;
  vm.loadSectors = loadSectors;

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
  function state(key) {
    vm.visibility = key;
  }

  /** creates a new location based on the selections made. */
  function submit(invalid) {

    // reject an invalid form
    if (invalid)  { return; }



  }
}
