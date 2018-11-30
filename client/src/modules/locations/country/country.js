angular.module('bhima.controllers')
  .controller('CountryController', CountryController);

CountryController.$inject = [
  'LocationService', 'util', 'NotifyService',
];

function CountryController(locationService, util, Notify) {
  const vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.countryLength = util.length45;

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Country
    refreshCountrys();
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.country = {};
  }

  vm.messages = {
    country : locationService.messages.country,
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


  // switch to update mode
  // data is an object that contains all the information of a country
  function update(data) {
    vm.view = 'update';
    vm.country = data;
  }

  // refresh the displayed Countrys
  function refreshCountrys() {
    return locationService.countries({ detailed : 1 }).then((data) => {
      vm.countries = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(form) {
    // stop submission if the form is invalid
    if (form.$invalid) { return 0; }

    const creation = (vm.view === 'create');
    const country = angular.copy(vm.country);

    const promise = (creation)
      ? locationService.create.country(country)
      : locationService.update.country(country.uuid, country);

    return promise
      .then(refreshCountrys)
      .then(() => {
        vm.view = creation ? 'create_success' : 'update_success';
      })
      .catch(Notify.handleError);
  }

  startup();
}
