// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ProvinceController', ProvinceController);

ProvinceController.$inject = [
  'LocationService', '$window', '$translate'
];

function ProvinceController(Locations, $window, $translate) {
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
    refreshProvinces();
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.province = {};
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
  // data is an object that contains all the information of a province
  function update(data) {
    vm.view = 'update';
    vm.province = data;
    vm.province.country_uuid = data.countryUuid;
  }

  
  // refresh the displayed Provinces
  function refreshProvinces() {
    return Locations.provinces({detailed : 1}).then(function (data) {
      vm.provinces = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var province = angular.copy(vm.province);
    
    promise = (creation) ?
      Locations.create.province(province) :
      Locations.update.province(province.uuid, province);

    promise
      .then(function (response) {
        return refreshProvinces();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}