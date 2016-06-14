angular.module('bhima.controllers')
.controller('EnterpriseController', EnterpriseController);

EnterpriseController.$inject = [
  'EnterpriseService', 'CurrencyService', 'util', 'NotifyService'
];

/**
 * Enterprise Controller
 */
function EnterpriseController(Enterprises, Currencies, util, Notify) {
  var vm = this;

  vm.view = 'default';
  vm.enterprises = [];
  vm.maxLength = util.maxTextLength;
  vm.length50 = util.length50;
  vm.length20 = util.length20;
  vm.length100 = util.length100;
  vm.length30 = util.length30;

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;

  // fired on startup
  function startup() {

    // load enterprises
    Enterprises.read(null, { detailed : 1 })
    .then(function (enterprises) {
      vm.enterprises = enterprises;
    }).catch(Notify.handleError);

    Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies;
    }).catch(Notify.handleError);

    vm.view = 'default';
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.enterprise = {};
  }

  // switch to update mode
  function update(id) {
    vm.enterprise = id;
    vm.view = 'update';
  }

  // refresh the displayed Enterprises
  function refreshEnterprises() {
    return Enterprises.read(null, { detailed : 1 })
    .then(function (enterprises) {
      vm.enterprises = enterprises;
    });
  }

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = (vm.view === 'create');
    var enterprise = angular.copy(vm.enterprise);

    promise = (creation) ?
      Enterprises.create(enterprise) :
      Enterprises.update(enterprise.id, enterprise);

    return promise
      .then(function () {
        return refreshEnterprises();
      })
      .then(function () {
        update(enterprise.id);
        Notify.success(creation ? 'FORM.INFOS.SAVE_SUCCESS' : 'FORM.INFOS.UPDATE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  startup();
}
