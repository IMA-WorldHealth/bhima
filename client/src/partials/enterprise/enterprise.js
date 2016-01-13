// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EnterpriseController', EnterpriseController);

EnterpriseController.$inject = [
  'EnterpriseService', 'CurrencyService', 'FormStateFactory'
];

function EnterpriseController(Enterprises, Currencies, StateFactory) {
  var vm = this;

  vm.enterprises = [];
  vm.state = new StateFactory();
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.formatLocation = formatLocation;
  vm.getElementCurrency = getElementCurrency;

  /* ------------------------------------------------------------------------ */

  function handler(error) {
    console.error(error);
    vm.state.error();
  }

  // fired on startup
  function startup() {
    // load Enterprises
    Enterprises.read().then(function (data) {
      vm.enterprises = data;
    }).catch(handler);

    Enterprises.readLocations().then(function (data) {
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

  function formatLocation(l) {
    return [l.name, l.sector_name, l.province_name, l.country_name].join(' -- ');
  }

  function getElementCurrency(id) {
    return Currencies.symbol(id);
  }
  // asnychronously load a enterprise from the server
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
    return Enterprises.read()
      .then(function (data) {
        vm.view = 'default';
        vm.enterprises = data;
      });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var enterpriseId;
    var promise;
    var creation = (vm.view === 'create');
    var enterprise = angular.copy(vm.enterprise);
    
    promise = (creation) ?
      Enterprises.create(enterprise) :
      Enterprises.update(enterprise.id, enterprise);

    promise
      .then(function (response) {
        enterpriseId = response.id;
        return refreshEnterprises();
      })
      .catch(handler);
  }

  startup();
}
