// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ServicesController', ServicesController);

ServicesController.$inject = [
  'ServiceService', 'EnterpriseService', 'FinancialService', 'FormStateFactory', '$translate', '$window', 'SessionService'
];

function ServicesController(Services, Enterprises, FinancialService, StateFactory, $translate, $window, SessionService) {
  var vm = this;

  vm.enterprises = [];
  vm.choosen = {};
  vm.state = new StateFactory();
  vm.view = 'default';
  vm.projectId = SessionService.project.id;

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.del    = del;
  vm.more   = more;  


  function handler(error) {
    console.error(error);
    vm.state.error();
  }

  // fired on startup
  function startup() {
    // load Services
    refreshServices();

    // load Enterprises
    Enterprises.read().then(function (data) {
      vm.enterprises = data;
    }).catch(handler);

    // load Cost Center
    FinancialService.readCostCenter().then(function (data) {
      vm.costCenters = data;
    }).catch(handler);

    // load Profit Center
    FinancialService.readProfitCenter().then(function (data) {
      vm.profitCenters = data;
    }).catch(handler);

    vm.state.reset();
  }

  function cancel() {
    vm.state.reset();
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.service = {};
  }

  // switch to update mode
  function update(data) {
    vm.state.reset();
    vm.service= data;
    vm.view = 'update';
  }

  // switch to view more information about 
  function more(data) {
    vm.state.reset();
    vm.service= data;
    vm.choosen.service = data.name;
    var ccId = data.cost_center_id;
    var pcId = data.profit_center_id;
    
    // load Cost Center value for a specific service 
    FinancialService.getCostCenter(vm.projectId,ccId).
    then(function (data) {
      vm.choosen.charge = data.cost;
    }).catch(handler);

    // load Profit Center value for a specific service 
    FinancialService.getProfitCenter(vm.projectId,pcId).
    then(function (data) {
      vm.choosen.profit = data.profit;
    }).catch(handler);

    vm.view = 'more';
  }

  // switch to delete warning mode
  function del(service) {
    var result = $window.confirm($translate.instant('PROJECT.CONFIRM'));
    if(result){
      vm.view = 'delete_confirm';
      Services.delete(service.id)
      .then(function (response) {
        refreshServices();
        vm.view = 'delete_success';
      }).catch(function (error) {
        vm.view = 'delete_error';
        vm.HTTPError = error;
      });
    } else {
      vm.view = 'default';
    } 
  }

  // refresh the displayed Services
  function refreshServices() {
    return Services.read(null, { full : 1 })
    .then(function (data) {
      vm.services = data;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var service = angular.copy(vm.service);

    promise = (creation) ?
      Services.create(service) :
      Services.update(service.id, service);

    promise
      .then(function (response) {
        return refreshServices();
      })
      .then(function () {
        update(service.id);
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();
}
