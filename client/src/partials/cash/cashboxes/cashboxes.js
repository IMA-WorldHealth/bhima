angular.module('bhima.controllers')
.controller('CashboxController', CashboxController);

CashboxController.$inject = [
  '$window', '$uibModal', 'SessionService', 'ProjectService', 'CashboxService',
  'CurrencyService', 'FormStateFactory'
];

/**
* Cashbox Controller
*
* This controller is responsible for creating new cashboxes for the enterprise.
* A valid cashbox must have accounts defined for each enterprise currency, for
* ease of use thought the application.
*/
function CashboxController($window, Modal, Session, Projects, Boxes, Currencies, StateFactory) {
  var vm = this;

  // bind variables
  vm.enterprise = Session.enterprise;
  vm.project = Session.project;
  vm.state = new StateFactory();
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.delete = del;
  vm.configureCurrency = configureCurrency;

  /* ------------------------------------------------------------------------ */

  function handler(error) {
    console.error(error);
    vm.state.error();
  }

  // fired on startup
  function startup() {

    // load projects
    Projects.read().then(function (data) {
      vm.projects = data;
    }).catch(handler);

    // load cashboxes
    Boxes.read().then(function (data) {
      vm.cashboxes = data;
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
    vm.box = {};
    vm.box.currencies = [];
    calculateCurrencyDiff();
  }

  // asnychronously load a cashbox from the server
  function loadCashbox(id) {
    return Boxes.read(id)
      .then(function (data) {

        // workaround until we build a type column into the database.
        // converts is_auxiliary into radio buttons
        data.type = (data.is_auxiliary) ? 'auxiliary' : 'primary';

        // bind the cashbox to the view
        vm.box = data;

        // calculate the currency difference
        calculateCurrencyDiff();
      });
  }

  // switch to update mode
  function update(id) {
    vm.state.reset();
    loadCashbox(id)
      .then(function () {
        vm.view = 'update';
      })
      .catch(handler);
  }

  // check if a currency is in the data.currencies array
  function hasCurrency(id) {
    return vm.box.currencies.some(function (c) {
      return c.currency_id === id;
    });
  }

  // calculate what currency accounts are missing from the cashbox
  function calculateCurrencyDiff() {
    vm.currencies.forEach(function (currency) {
      currency.configured = hasCurrency(currency.id);
    });
  }

  // refresh the displayed cashboxes
  function refreshBoxes() {
    return Boxes.read()
      .then(function (cashboxes) {
        vm.cashboxes = cashboxes;
      });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var cashboxId;
    var promise;
    var creation = (vm.view === 'create');
    var box = angular.copy(vm.box);

    box.is_auxiliary = (box.type === 'auxiliary') ?  0 : 1;

    promise = (creation) ?
      Boxes.create(box) :
      Boxes.update(box.id, box);

    promise
      .then(function (response) {
        cashboxId = response.id;
        return refreshBoxes();
      })
      .then(function () {
        update(cashboxId);
        vm.state[creation ? 'create' : 'update']();
      })
      .catch(handler);
  }

  /** @todo - this should be a modal */
  function del(box) {
    var yes =
      $window.confirm('Are you sure you want to delete this cashbox?');

    if (yes) {
      Boxes.delete(box.id)
      .then(function (message) {
        vm.view = 'default';
        vm.state.delete();
        return refreshBoxes();
      })
      .catch(handler);
    }
  }

  // configure the currency account for a cashbox
  function configureCurrency(currency) {

    var instance = Modal.open({
      templateUrl : 'partials/cash/cashboxes/modal.html',
      controller : 'CashboxCurrencyModalController as CashboxModalCtrl',
      size : 'md',
      backdrop : 'static',
      animation: false,
      resolve : {
        currency : function () {
          return currency;
        },
        cashbox : function () {
          return vm.box;
        },
        data : function () {

          // catch in case of 404, none specified default to empty object
          return Boxes.currencies.read(vm.box.id, currency.id)
            .catch(function () { return {}; });
        }
      }
    });

    instance.result
      .then(function (data) {
        vm.state.update();
        return loadCashbox(vm.box.id);
      });
  }

  startup();
}
