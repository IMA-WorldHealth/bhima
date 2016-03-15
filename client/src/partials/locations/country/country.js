// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('CountryController', CountryController);

CountryController.$inject = [
  'LocationService', '$window', '$translate'
];

function CountryController(Locations, $window, $translate) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;


  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Subsidies
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
    country : Locations.messages.country
  };

  /** load countries on startup */
  Locations.countries()
  .then(function (countries) {

    // bind the countries to the view for <select>ion
    vm.countries = countries;

    // make sure that we are showing the proper message to the client
    vm.messages.country = (countries.length > 0) ?
      Locations.messages.country :
      Locations.messages.empty;
  });


  // switch to update mode
  // data is an object that contains all the information of a country
  function update(data) {
    vm.view = 'update';
    vm.country = data;
  }

  
  // refresh the displayed Countrys
  function refreshCountrys() {
    return Locations.countries({detailed : 1}).then(function (data) {
      vm.countries = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var country = angular.copy(vm.country);
    
    promise = (creation) ?
      Locations.create.country(country) :
      Locations.update.country(country.uuid, country);

    promise
      .then(function (response) {
        return refreshCountrys();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}