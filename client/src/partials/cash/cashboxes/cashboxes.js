angular.module('bhima.controllers')
.controller('CashboxController', CashboxController);

CashboxController.$inject = [
  '$uibModal', 'SessionService', 'ProjectService', 'CashboxService',
  'CurrencyService', 'ModalService', 'util', 'NotifyService'
];

/**
 * Cashbox Controller
 *
 * This controller is responsible for creating new cashboxes for the enterprise.
 * A valid cashbox must have accounts defined for each enterprise currency, for
 * ease of use thought the application.
 */
function CashboxController(Modal, Session, Projects, Boxes, Currencies, ModalService, util, Notify) {
  var vm = this;

  // bind variables
  vm.enterprise = Session.enterprise;
  vm.project = Session.project;

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.delete = remove;
  vm.configureCurrency = configureCurrency;

  vm.maxLength = util.maxTextLength;

  /* ------------------------------------------------------------------------ */

  // fired on startup
  function startup() {

    // load projects
    Projects.read().then(function (projects) {
      vm.projects = projects;
    }).catch(Notify.handleError);

    // load cashboxes
    Boxes.read().then(function (cashboxes) {
      vm.cashboxes = cashboxes;
    }).catch(Notify.handleError);

    Currencies.read().then(function (currencies) {
      vm.currencies = currencies;
    }).catch(Notify.handleError);

    vm.view = 'default';
  }

  function cancel() {
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
    loadCashbox(id)
      .then(function () {
        vm.view = 'update';
      })
      .catch(Notify.handleError);
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
  function submit(form) {
    if (form.$invalid) {
      // Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var cashboxId;
    var promise;
    var creation = (vm.view === 'create');
    var box = angular.copy(vm.box);

    box.is_auxiliary = (box.type === 'auxiliary') ?  0 : 1;

    promise = (creation) ?
      Boxes.create(box) :
      Boxes.update(box.id, box);

    return promise
      .then(function (response) {
        cashboxId = response.id;
        return refreshBoxes();
      })
      .then(function () {
        Notify.success(creation ? 'FORM.INFOS.CREATE_SUCCESS' : 'FORM.INFOS.UPDATE_SUCCESS');
        update(cashboxId);
      })
      .catch(Notify.handleError);
  }

  function remove(box) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {

      if (!bool) { return; }

      Boxes.delete(box.id)
      .then(function (message) {
        vm.view = 'default';
        Notify.success('FORM.INFOS.DELETE_SUCCESS');
        return refreshBoxes();
      })
      .catch(Notify.handleError);
    });
  }

  /**
   * configure the currency account for a cashbox
   * @todo - should this be in it's own service?
   */
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
      .then(function () {
        Notify.success('FORM.INFOS.UPDATE_SUCCESS');
        update(vm.cashbox.id);
      })
      .catch(function (data) {
        if (data) { Notify.handleError(data); }
      });
  }

  startup();
}
