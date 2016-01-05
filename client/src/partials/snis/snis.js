angular.module('bhima.controllers')
.controller('SnisController', SnisController);

SnisController.$inject = [
  '$scope', '$q', '$translate', '$http', '$location',
  'validate', 'messenger', 'connect', 'appstate'
];

function SnisController($scope, $q, $translate, $http, $location, validate, messenger, connect, appstate) {
  var dependencies = {};

  // dependencies.reports = {
  //   query : '/snis/getAllReports'
  // };

  dependencies.reports = {
    query : {
      tables : {
        'mod_snis_rapport' : { columns : ['id', 'date'] },
        'project'          : { columns : ['name'] }
      },
      join : ['mod_snis_rapport.id_snis_hopital=project.id']
    }
  };

  appstate.register('project', function (project) {
    $scope.project = project;
    dependencies.reports.query.where = ['project.id='+$scope.project.id];
    validate.process(dependencies, ['reports'])
    .then(init);
  });

  function init(model) {
    angular.extend($scope, model);
  }

  $scope.print = function (obj) {

  };

  $scope.edit = function (obj) {
    $location.path('/snis/update/' + obj.id);
  };

  $scope.delete = function (obj) {
    $http.delete('/snis/deleteReport/' + obj.id)
    .success(function (res) {
      validate.refresh(dependencies, ['reports'])
      .then(init)
      .then(function () {
        messenger.success('[succes] Rapport supprime avec succes', true);
      });
    });
  };
}
