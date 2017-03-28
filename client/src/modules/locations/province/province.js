// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ProvinceController', ProvinceController);

ProvinceController.$inject = [
  'LocationService', 'util'
];

function ProvinceController(locationService, util) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';
  vm.state = {};

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.maxLength = util.maxTextLength;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Provinces
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
    country : locationService.messages.country
  };

  /** load countries on startup */
  locationService.countries()
  .then(function (countries) {

    // bind the countries to the view for <select>ion
    vm.countries = countries;

    // make sure that we are showing the proper message to the client
    vm.messages.country = (countries.length > 0) ?
      locationService.messages.country :
      locationService.messages.empty;
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
    return locationService.provinces({detailed : 1}).then(function (data) {
      vm.provinces = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(form) {
    // stop submission if the form is invalid
    if (form.$invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var province = angular.copy(vm.province);

    promise = (creation) ?
      locationService.create.province(province) :
      locationService.update.province(province.uuid, province);

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
