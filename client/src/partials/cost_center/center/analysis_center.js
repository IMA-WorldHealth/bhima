angular.module('bhima.controllers')
.controller('AnalysisCostCenterController', AnalysisCostCenterController);

AnalysisCostCenterController.$inject = [
  'connect', 'messenger', 'validate', '$translate', 'SessionService'
];

/**
  * Analysis Cost Center Controller
  * This controller is responsible for make crud operations with cost centers
  */
function AnalysisCostCenterController (connect, messenger, validate, $translate, SessionService) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  dependencies.cost_centers = {
    query : {
      tables : {
        'cost_center' : {
          columns : ['id', 'text', 'note', 'is_principal']
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
    vm.enterprise = SessionService.enterprise;
    validate.process(dependencies).then(init);
  }

  function init(model) {
    vm.model = model;
    session.state = 'loaded';
  }

  function setAction(value, costCenter) {
    vm.action = value;
    vm.selected = angular.copy(costCenter) || {};
  }

  function writeCenter(center) {
    return connect.post('cost_center', connect.clean(center));
  }

  function save() {
    writeCenter(vm.register)
    .then(function() {
      validate.refresh(dependencies, ['cost_centers']).then(function (model) {
        angular.extend(vm, model);
      });

      vm.register = {};
      vm.action = 'default';
      messenger.success($translate.instant('ANALYSIS_CENTER.INSERT_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      messenger.error($translate.instant('ANALYSIS_CENTER.INSERT_FAIL_MESSAGE'));
    });
  }

  function remove(costCenter) {
    vm.selected = angular.copy(costCenter);
    removeCostcenter(vm.selected.id)
    .then(function () {
      vm.model.cost_centers.remove(vm.selected.id);
      messenger.success($translate.instant('ANALYSIS_CENTER.REMOVE_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      var msg = $translate.instant('ANALYSIS_CENTER.REMOVE_FAIL_MESSAGE').replace('%VAR%', vm.selected.text);
      messenger.error(msg);
    });
  }

  function edit() {
    updateCostCenter(vm.selected)
    .then(function () {
      vm.model.cost_centers.put(vm.selected);
      vm.selected = {};
      vm.action = 'default';
      messenger.success($translate.instant('ANALYSIS_CENTER.UPDATE_SUCCESS_MESSAGE'));
    })
    .catch(function () {
      messenger.error($translate.instant('ANALYSIS_CENTER.UPDATE_FAIL_MESSAGE'));
    });
  }

  function removeCostcenter(costCenterId) {
    return connect.delete('cost_center', 'id', costCenterId);
  }

  function updateCostCenter(costCenter) {
    return connect.put('cost_center', [connect.clean(costCenter)], ['id']);
  }

}
