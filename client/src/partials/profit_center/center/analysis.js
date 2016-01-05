angular.module('bhima.controllers')
.controller('AnalysisProfitCenterController', AnalysisProfitCenterController);

AnalysisProfitCenterController.$inject = [
  'connect', 'messenger', 'validate', '$translate', 'SessionService'
];

/**
  * Analysis Profit Center Controller
  * This controller is responsible for make crud operations with profit centers
  */
function AnalysisProfitCenterController (connect, messenger, validate, $translate, SessionService) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  dependencies.profit_centers = {
    query : {
      tables : {
        'profit_center' : {
          columns : ['id', 'text', 'note']
        }
      }
    }
  };

  vm.setAction = setAction;
  vm.save      = save;
  vm.remove    = remove;
  vm.edit      = edit;
  vm.register  = {};
  vm.selected  = {};

  startup();

  function startup() {
    session.state = 'loading';
    vm.project = SessionService.project;
    validate.process(dependencies).then(init);
  }

  function init(model) {
    vm.model = model;
    session.state = 'loaded';
  }

  function setAction(value, profit_center) {
    vm.action = value;
    vm.selected = angular.copy(profit_center) || {};
  }

  function writeCenter(center) {
    return connect.post('profit_center', connect.clean(center));
  }

  function save() {
    vm.register.project_id = vm.project.id;
    writeCenter(vm.register)
    .then(function() {
      validate.refresh(dependencies, ['profit_centers'])
      .then(function (model) {
        angular.extend(vm, model);
      });
      vm.register = {};
      vm.action = 'default';
      messenger.success($translate.instant('ANALYSIS_PROFIT_CENTER.INSERT_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      messenger.danger($translate.instant('ANALYSIS_PROFIT_CENTER.INSERT_FAIL_MESSAGE'));
    });
  }

  function remove(profitCenter) {
    vm.selected = angular.copy(profitCenter);
    removeProfitCenter(vm.selected.id)
    .then(function () {
      vm.model.profit_centers.remove(vm.selected.id);
      messenger.success($translate.instant('ANALYSIS_PROFIT_CENTER.REMOVE_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      var msg = $translate.instant('ANALYSIS_PROFIT_CENTER.REMOVE_FAIL_MESSAGE').replace('%VAR%', vm.selected.text);
      messenger.error(msg);
    });
  }

  function edit() {
    updateProfitCenter(vm.selected)
    .then(function () {
      vm.model.profit_centers.put(vm.selected);
      vm.action = 'default';
      messenger.success($translate.instant('ANALYSIS_PROFIT_CENTER.UPDATE_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      messenger.error($translate.instant('ANALYSIS_PROFIT_CENTER.UPDATE_FAIL_MESSAGE'));
    });
  }

  function removeProfitCenter(profitCenterId) {
    return connect.delete('profit_center', 'id', profitCenterId);
  }

  function updateProfitCenter(profitCenter) {
    return connect.put('profit_center', [connect.clean(profitCenter)], ['id']);
  }

}
