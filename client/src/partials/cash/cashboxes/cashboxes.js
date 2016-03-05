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
* ease of use trhought the application.
*/
function CashboxController($window, $uibModal, Session, Projects, Boxes, Currencies, StateFactory) {
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
        // converts is_aux and is_bank columns into radio button select
        if (data.is_auxillary) {
          data.type = 'auxillary';
        } else if (data.is_bank) {
          data.type = 'bank';
        } else {
          data.type = 'primary';
        }

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

    // convert radio buttons into db columns
    switch (box.type) {
      case 'bank' :
        box.is_bank = 1;
        box.is_auxillary = 0;
        break;
      case 'auxillary' :
        box.is_bank = 0;
        box.is_auxillary = 1;
        break;
      default :
        box.is_bank = 0;
        box.is_auxillary = 0;
        break;
    }

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

    var instance = $uibModal.open({
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
