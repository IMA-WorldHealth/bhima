angular.module('bhima.controllers')
.controller('ServicesController', ServicesController);

ServicesController.$inject = [
  '$scope', '$q', '$translate', 'validate', 'messenger',
  'connect', 'appstate', 'SessionService'
];

function ServicesController($scope, $q, $translate, validate, messenger, connect, appstate, SessionService) {
  var dependencies = {}, cost_center = {}, service ={},
      configuration = $scope.configuration = {};

  $scope.choosen = {};

  dependencies.projects = {
    query : {
      tables : {
        'project' : {
          columns : ['id', 'name', 'abbr', 'enterprise_id']
        }
      }
    }
  };

  dependencies.costs = {
    query : {
      tables : {
        'cost_center' : {
          columns : ['id', 'text']
        }
      }
    }
  };

  dependencies.profits = {
    query : {
      tables : {
        'profit_center' : {
          columns : ['id', 'text']
        }
      }
    }
  };

  dependencies.services = {
    query :'/services/'
  };

  dependencies.cost_centers = {
    query : '/available_cost_center/'
  };

  dependencies.profit_centers = {
    query : '/available_profit_center/'
  };

  startup();

  function startup() {
    $scope.project = SessionService.project;
    validate.process(dependencies)
    .then(init)
    .catch(error);
  }

  function init (model) {
    $scope.model = model;
    configuration.cost_centers = model.cost_centers.data;
    configuration.profit_centers = model.profit_centers.data;
  }

  function save() {
    writeService()
    .then(function () {
      // FIXME just add service to model
      validate.refresh(dependencies, ['services'])
      .then(function (model) {
        angular.extend($scope, model);
        messenger.success($translate.instant('SERVICE.INSERT_SUCCESS_MESSAGE'));
      });

      $scope.service = {};
    })
    .catch(function () {
      messenger.danger($translate.instant('SERVICE.INSERT_FAIL_MESSAGE'));
    });
  }

  function writeService () {
    return connect.post('service', [connect.clean($scope.service)]);
  }

  function setAction (value, service) {
    $scope.choosen = angular.copy(service) || {};
    if (value === 'more') {
      getCost($scope.choosen.cost_center_id)
      .then(handleResultCost)
      .then(getProfit)
      .then(handleResultProfit);
    } else if (value === 'edit') {
      configuration.cost_centers = $scope.model.costs.data;
      configuration.profit_centers = $scope.model.profits.data;
    }
    $scope.action = value;
  }

  function getProfit() {
    return connect.req('/profit/' + $scope.project.id + '/' + $scope.choosen.profit_center_id);
  }

  function edit() {
    var data = {
      id                : $scope.choosen.id,
      name              : $scope.choosen.service,
      cost_center_id    : $scope.choosen.cost_center_id,
      profit_center_id  : $scope.choosen.profit_center_id
    };

    if (isValid(data.cost_center_id, data.profit_center_id)) {
      connect.put('service', [connect.clean(data)], ['id'])
      .then(function () {
        $scope.choosen.cost_center = $scope.choosen.cost_center_id ? getCostcenterText($scope.choosen.cost_center_id) : $scope.choosen.cost_center;
        $scope.choosen.profit_center = $scope.choosen.profit_center_id ? getProfitCenterText($scope.choosen.profit_center_id) : $scope.choosen.profit_center;
        $scope.model.services.put(connect.clean($scope.choosen));
        $scope.action = '';
        $scope.choosen = {}; // reset
      })
      .catch(function (err) {
        messenger.danger('Error:' + JSON.stringify(err));
      });
    }else{
      alert('centre de cout ou centre de profit deja utilise');
    }

  }

  function isValid (cost_id, profit_id) {
    var c = $scope.model.services.data.filter(function (item) {
      return (item.cost_center_id === cost_id && $scope.choosen.id !== item.id) || (item.profit_center_id === profit_id && $scope.choosen.id !== item.id);
    })[0];

    return c ? false : true;
  }

  function getCostcenterText(cost_id) {
    //FIX ME : hack
    return configuration.cost_centers.filter(function (item) {
      return item.id === cost_id;
    })[0].text;
  }

  function getProfitCenterText (profit_id) {
    //FIX ME : hack
    return configuration.profit_centers.filter(function (item) {
      return item.id === profit_id;
    })[0].text;
  }


  function handleResultCost(value) {
    $scope.choosen.charge = value.data.cost;
    return $q.when();
  }

  function handleResultProfit(value) {
    $scope.choosen.profit = value.data.profit;
    return $q.when();
  }

  function getCost(ccId) {
    return connect.req('/cost/' + $scope.project.id + '/' + ccId);
  }

  function error(err) {
    console.log('Error', err);
  }

  $scope.save = save;
  $scope.service = service;
  $scope.cost_center = cost_center;
  $scope.setAction = setAction;
  $scope.edit = edit;
}
