angular.module('bhima.controllers')
  .controller('SectorController', SectorController);

SectorController.$inject = [
  'LocationService', 'util', 'NotifyService',
];

function SectorController(locationService, util, Notify) {
  const vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;

  vm.loadProvinces = loadProvinces;
  vm.maxLength = util.maxTextLength;

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Sectors
    refreshSectors();
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.sector = {};
  }

  vm.messages = {
    country : locationService.messages.country,
    province : locationService.messages.province,
    sector : locationService.messages.sector,
  };

  /** load countries on startup */
  locationService.countries()
    .then((countries) => {

      // bind the countries to the view for <select>ion
      vm.countries = countries;

      // make sure that we are showing the proper message to the client
      vm.messages.country = (countries.length > 0)
        ? locationService.messages.country
        : locationService.messages.empty;
    });

  /** loads provinces based on the selected country */
  function loadProvinces() {

    // make sure we do not make unnecessary HTTP requests
    if (!vm.sector.country_uuid) { return; }

    locationService.provinces({ country : vm.sector.country_uuid })
      .then((provinces) => {

        // bind the provinces to the view for <select>ion
        vm.provinces = provinces;

        // make sure that we show the correct message in the <select> option
        vm.messages.province = (provinces.length > 0)
          ? locationService.messages.province
          : locationService.messages.empty;
      });
  }

  // switch to update mode
  // data is an object that contains all the information of a sector
  function update(data) {
    vm.view = 'update';
    vm.sector = data;

    vm.sector.sector_uuid = data.sectorUuid;
    vm.sector.province_uuid = data.provinceUuid;
    vm.sector.country_uuid = data.countryUuid;
    loadProvinces();
  }


  // refresh the displayed Sectors
  function refreshSectors() {
    return locationService.sectors({ detailed : 1 }).then((data) => {
      vm.sectors = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(form) {
    // stop submission if the form is invalid
    if (form.$invalid) { return 0; }

    const creation = (vm.view === 'create');
    const sector = angular.copy(vm.sector);

    const promise = (creation)
      ? locationService.create.sector(sector)
      : locationService.update.sector(sector.uuid, sector);

    return promise
      .then(refreshSectors)
      .then(() => {
        vm.view = creation ? 'create_success' : 'update_success';
      })
      .catch(Notify.handleError);
  }

  startup();
}
