angular.module('bhima.controllers')
.controller('ConfigAccountingController', ConfigAccountingController);

ConfigAccountingController.$inject = [
  '$translate', '$http', 'validate', 'messenger', 'connect', 'SessionService'
];

/**
  * Config Account Controller
  * This controller is responsible to manage account configuration for Payroll
  */
function ConfigAccountingController ($translate, $http, validate, messenger, connect, SessionService) {
  var vm           = this,
      dependencies = {},
      session      = vm.session = {};

  dependencies.config_accountings = {
    query : {
      identifier : 'id',
      tables : {
        'config_accounting' : { columns : ['id', 'label', 'account_id'] },
        'account'           : { columns : ['account_number', 'account_txt'] }
      },
      join : ['config_accounting.account_id=account.id']
    }
  };

  dependencies.accounts = {
    query : '/getAccount6/'
  };

  // Expose to the view
  vm.delete    = deletion;
  vm.edit      = edit;
  vm.new       = create;
  vm.save      = {};
  vm.save.edit = saveEdit;
  vm.save.new  = saveNew;

  // Startup
  startup();

  // Functions
  function startup() {
    vm.enterprise = SessionService.enterprise;
    validate.process(dependencies)
    .then(initialize);
  }

  function initialize (models) {
    angular.extend(vm, models);
  }

  function deletion (config_accountings) {
    var result = confirm($translate.instant('TAXES.CONFIRM'));
    if (result) {
      connect.delete('config_accounting', config_accountings.id, 'id')
      .then(function () {
        vm.config_accountings.remove(config_accountings.id);
        messenger.info($translate.instant('TAXES.DELETE_SUCCESS'));
      })
      .catch(error);
    }
  }

  function edit (config_accountings) {
    session.action = 'edit';
    session.edit = angular.copy(config_accountings);
  }

  function create () {
    session.action = 'new';
    session.new = {};
  }

  function saveEdit () {
    var record = angular.copy(connect.clean(session.edit));
    delete record.reference;
    delete record.account_number;
    delete record.account_txt;

    connect.put('config_accounting', [record], ['id'])
    .then(function () {
      return validate.refresh(dependencies);
    })
    .then(function (models) {
      angular.extend(vm, models);
      messenger.success($translate.instant('TAXES.UPDATE_SUCCES'));
      session.action = '';
      session.edit = {};
    })
    .catch(error);
  }

  function saveNew () {
    var record = connect.clean(session.new);
    connect.post('config_accounting', [record], ['id'])
    .then(function () {
      return validate.refresh(dependencies);
    })
    .then(function (models) {
      angular.extend(vm, models);
      session.action = '';
      session.new    = {};
    })
    .catch(error);
  }

  function error(err) {
    messenger.error(err);
  }

}
