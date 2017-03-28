angular.module('bhima.controllers')
.controller('CashboxUpdateController', CashboxUpdateController);

CashboxUpdateController.$inject = ['$state', '$uibModal', 'ModalService', 'NotifyService', 'CashboxService', 'CurrencyService'];

function CashboxUpdateController($state, Modal, ModalService, Notify, Boxes, Currencies) {
  var vm = this;

  vm.submit = submit;
  vm.configureCurrency = configureCurrency;
  vm.remove = remove;

  var CREATE_STATE = 'cashboxes.create';

  // temporary method of determining if we're in create state
  var creating = $state.current.name === CREATE_STATE;

  var cashboxUuid = $state.params.uuid;

  // TODO this information could be shared by the parent controller
  Currencies.read().then(function (currencies) {
      vm.currencies = currencies;

      // if we have a cashbox (and are subsequently in the edit state), load its information
      if (angular.isDefined(cashboxUuid)) {
        loadCashbox(cashboxUuid);
      } else {
        // FIXME remove convuluted logic
        vm.box.is_auxiliary = 1;
      }

    }).catch(Notify.handleError);


  vm.box = {};

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var cashboxId;
    var promise;
    var box = angular.copy(vm.box);

        // box.is_auxiliary = (box.type === 'auxiliary') ?  0 : 1;

    promise = (creating) ?
      Boxes.create(box) :
      Boxes.update(box.id, box);

    return promise
      // .then(function (response) {
        // cashboxId = response.id;

        // return refreshBoxes();
      // })
      .then(function () {

        Notify.success(creating ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
        $state.go('cashboxes.list', null, { reload : true});
        // update(cashboxId);
      })
      .catch(Notify.handleError);
  }

  // asnychronously load a cashbox from the server
  function loadCashbox(id) {
    return Boxes.read(id)
      .then(function (data) {
        // bind the cashbox to the view
        vm.box = data;

        // calculate the currency difference
        calculateCurrencyDiff();
      });
  }

  // check if a currency is in the data.currencies array
  function hasCurrency(id) {
    return vm.box.currencies.some(function (c) {
      return c.currency_id === id;
    });
  }

  function calculateCurrencyDiff() {
    vm.currencies.forEach(function (currency) {
      currency.configured = hasCurrency(currency.id);
    });
  }

  /**
   * configure the currency account for a cashbox
   * @todo - should this be in it's own service?
   */
  function configureCurrency(currency) {

    var instance = Modal.open({
      templateUrl : 'modules/cash/cashboxes/configure_currency/modal.html',
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
        Notify.success('FORM.INFO.UPDATE_SUCCESS');

        // TODO optimistically update without the need for additional connection (unless for verifcation)
        loadCashbox(vm.box.id);
      })
      .catch(function (data) {
        if (data) { Notify.handleError(data); }
      });
  }

  function remove(box) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {

      if (!bool) { return; }

      Boxes.delete(box.id)
      .then(function (message) {
        Notify.success('FORM.INFO.DELETE_SUCCESS');

        $state.go('cashboxes.list', null, { reload : true });
        return;
      })
      .catch(Notify.handleError);
    });
  }
}


