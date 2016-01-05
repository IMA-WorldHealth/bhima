angular.module('bhima.controllers')
.controller('CostCenterAssignmentController', CostCenterAssignmentController);

CostCenterAssignmentController.$inject = [
  '$scope', '$q', 'connect', 'appstate', 'messenger', 'validate',
  'util', '$translate', 'SessionService'
];

/**
* Cost Center Assignment Controller
*/
function CostCenterAssignmentController($scope, $q, connect, appstate, messenger, validate, util, $translate, Session) {
  var dependencies = {},
      config = $scope.configuration = {};

  dependencies.aux_cost_centers = {
    query : {
      tables : {
        'cost_center' : {
          columns : ['id', 'text', 'note']
        }
      },
      where : ['cost_center.is_principal=0']
    }
  };

  dependencies.pri_cost_centers = {
    query : {
      tables : {
        'cost_center' : {
          columns : ['id', 'text', 'note']
        },
      },
      where : ['cost_center.is_principal=1']
    }
  };

  startup();

  function startup() {
    $scope.project = Session.project;
    $scope.enterprise = Session.enterprise;
    validate.process(dependencies)
    .then(init)
    .catch(error);
  }

  function init(model) {
    $scope.model = model;
    $scope.cc = {};
    $scope.cc.all = false;
  }

  function performChange() {
    $scope.selected_aux_cost_center = config.aux_cost_center;
  }

  function isForwardable() {
    if (!$scope.selected_aux_cost_center) { return false; }
    if (!$scope.model.pri_cost_centers.data.length) { return false; }
    return $scope.model.pri_cost_centers.data.some(function (account) {
      return account.checked;
    });
  }

  function checkAll() {
    $scope.model.pri_cost_centers.data.forEach(function (item) {
      item.checked = $scope.cc.all;
    });
  }

  function setAction(action) {
    $scope.action = action;
  }

  function processSelectedCost(cc) {
    return connect.req('/cost/'+ $scope.project.id + '/' + cc.id);
  }

  function suivant() {
    $scope.model.selected_pri_cost_centers = $scope.model.pri_cost_centers.data.filter(function (cc) {
      return cc.checked;
    });

    processSelectedCost($scope.selected_aux_cost_center)
    .then(handleResult)
    .then(processPrincipalsCenters)
    .then(handleResults)
    .then(function() {
      setAction('suivant');
      calculate();
    })
    .catch(error);
  }

  function processPrincipalsCenters() {
    $scope.model.selected_pri_cost_centers.forEach(function (pc) {
      pc.criteriaValue = 1;
    });
    return $q.all(
      $scope.model.selected_pri_cost_centers.map(function (pc) {
        return processSelectedCost(pc);
      })
    );
  }

  function handleResult(cout) {
    $scope.selected_aux_cost_center.cost = cout.data.cost;
    return $q.when();
  }

  function handleResults(couts) {
    couts.forEach(function (cout, index) {
      $scope.model.selected_pri_cost_centers[index].initial_cost = cout.data.cost;
    });
    return $q.when();
  }

  function calculate() {
    var somCritereValue = 0;
    $scope.model.selected_pri_cost_centers.forEach(function (item) {
      somCritereValue+=item.criteriaValue;
    });
    $scope.model.selected_pri_cost_centers.forEach(function (item) {
      item.allocatedCost = $scope.selected_aux_cost_center.cost * (item.criteriaValue / somCritereValue);
      item.allocatedCost = item.allocatedCost || 0;
      item.totalCost = item.initial_cost + item.allocatedCost;
    });
  }

  function getTotalAllocatedCost() {
    var som = 0;
    $scope.model.selected_pri_cost_centers.forEach(function (item) {
      som += item.allocatedCost || 0;
    });
    return som;
  }

  function getTotal() {
    var som = 0;
    $scope.model.selected_pri_cost_centers.forEach(function (item) {
      som += item.totalCost || 0;
    });
    return som;
  }

  function apply() {
    sanitize()
    .then(writeAssignation)
    .then(writeAssignationItem)
    .then(handleSucess)
    .catch(handleApplyError);
  }

  function sanitize() {
    $scope.assignation = {
      project_id : $scope.project.id,
      auxi_cc_id : $scope.selected_aux_cost_center.id,
      cost       : $scope.selected_aux_cost_center.cost,
      date       : util.sqlDate(new Date()),
      note       : 'Assignation/'+$scope.selected_aux_cost_center.text+'/'+new Date().toString()
    };

    $scope.assignation_items = [];
    $scope.model.selected_pri_cost_centers.forEach(function (pc) {
      var ass_item = {
        pri_cc_id : pc.id,
        init_cost : pc.initial_cost,
        value_criteria : pc.criteriaValue
      };
      $scope.assignation_items.push(ass_item);
    });
    return $q.when();
  }

  function writeAssignation () {
    return connect.post('cost_center_assignation', [ $scope.assignation ]);
  }

  function writeAssignationItem (model) {
    $scope.assignation_items.forEach(function (item) {
      item.cost_center_assignation_id = model.data.insertId;
    });
    return connect.post('cost_center_assignation_item', $scope.assignation_items);
  }

  function handleSucess () {
    messenger.success($translate.instant('ASSIGNING.INSERT_SUCCES_MESSAGE'));
  }

  function handleApplyError () {
    messenger.danger($translate.instant('SERVICE.INSERT_FAIL_MESSAGE'));
  }

  function error(err) {
    console.log('Error: ', err);
  }

  $scope.performChange = performChange;
  $scope.checkAll = checkAll;
  $scope.isForwardable = isForwardable;
  $scope.suivant = suivant;
  $scope.calculate = calculate;
  $scope.getTotalAllocatedCost = getTotalAllocatedCost;
  $scope.getTotal = getTotal;
  $scope.apply = apply;
}
