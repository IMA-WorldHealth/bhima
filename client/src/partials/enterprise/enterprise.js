// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EnterpriseController', EnterpriseController);

EnterpriseController.$inject = [
  'EnterpriseService', 'CurrencyService', 'LocationService', 'FormStateFactory'
];

function EnterpriseController(Enterprises, Currencies, Locations, StateFactory) {
  var vm = this;

  vm.enterprises = [];
  vm.state = new StateFactory();
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.getCurrencySymbol = getCurrencySymbol;

  function handler(error) {
    console.error(error);
    vm.state.error();
  }

  // fired on startup
  function startup() {
    // load Enterprises
    Enterprises.read_detailed().then(function (data) {
      vm.enterprises = data;
    }).catch(handler);

    Locations.readLocations().then(function (data) {
      data.forEach(function (l) {
        l.format = [l.name, l.sector_name, l.province_name, l.country_name].join(' -- ');
      });
      vm.locations = data;
    }).catch(handler);

    Currencies.read().then(function (data) {
      vm.currencies = data;
    }).catch(handler);

    vm.state.reset();
  }

  function cancel() {
    vm.state.reset();
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.enterprise = {};
  }

  function getCurrencySymbol(id) {
    return Currencies.symbol(id);
  }
  // Load a enterprise from the server
  function loadEnterprise(data) {
    vm.enterprise = data;      
  }

  // switch to update mode
  function update(id) {
    vm.state.reset();
    loadEnterprise(id);
    vm.view = 'update';
  }

  // refresh the displayed Enterprises
  function refreshEnterprises() {
    return Enterprises.read_detailed()
      .then(function (data) {
        vm.enterprises = data;
      });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var enterprise = angular.copy(vm.enterprise);

    promise = (creation) ?
      Enterprises.create(enterprise) :
      Enterprises.update(enterprise.id, enterprise);

    promise
      .then(function (response) {
        return refreshEnterprises();
      })
      .then(function () {
        update(enterprise.id);
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();
}
