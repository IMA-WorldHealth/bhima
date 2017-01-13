angular.module('bhima.controllers')
.controller('ServicesController', ServicesController);

ServicesController.$inject = [
  'ServiceService', 'EnterpriseService', 'FinancialService', '$translate', 'SessionService', 'ModalService', 'util'
];

function ServicesController(Services, Enterprises, FinancialService, $translate, SessionService, ModalService, util) {
  var vm = this;

  vm.enterprises = [];
  vm.choosen = {};
  vm.state = 'default';
  vm.view = 'default';
  vm.projectId = SessionService.project.id;

  vm.maxLength = util.maxTextLength;

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

  // sets the module view state
  function setState(state) {
    vm.state = state;
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

    setState('default');
  }

  function cancel() {
    setState('default');
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.service = {};
  }

  // switch to update mode
  // data is an object that contains all the information of a service
  function update(data) {
    setState('default');
    vm.service= data;
    vm.view = 'update';
  }

  // switch to view more information about
  // data is an object that contains all the information of a service
  function more(data) {
    setState('default');
    vm.service= data;
    vm.choosen.service = data.name;
    var ccId = data.cc_id;
    var pcId = data.pc_id;

    // load Cost Center value for a specific service
    FinancialService.getFeeValue(ccId).
    then(function (data) {
      vm.choosen.charge = data.value;
    }).catch(handler);

    // load Profit Center value for a specific service
    FinancialService.getFeeValue(pcId).
    then(function (data) {
      vm.choosen.profit = data.value;
    }).catch(handler);

    vm.view = 'more';
  }

  // switch to delete warning mode
  function del(service) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool){
     // if the user clicked cancel, reset the view and return
       if (!bool) {
          vm.view = 'default';
          return;
       }

      // if we get there, the user wants to delete a service
      vm.view = 'delete_confirm';
      Services.delete(service.id)
      .then(function () {
         vm.view = 'delete_success';
         return refreshServices();
      })
      .catch(function (error) {
        vm.HTTPError = error;
        vm.view = 'delete_error';
      });
    });
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
