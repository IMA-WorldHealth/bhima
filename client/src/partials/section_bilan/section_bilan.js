angular.module('bhima.controllers')
.controller('sectionBilan', [
  '$scope',
  '$translate',
  'validate',
  'connect',
  'messenger',
  function ($scope, $translate, validate, connect, messenger) {
    var dependencies = {},
        session = $scope.session = {};

    dependencies.sectionBilans = {
      query : {
        identifier : 'id',
        tables : {
          'section_bilan' : {
            columns : ['id', 'text', 'is_actif', 'position']
          }
        }
      }
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    validate.process(dependencies)
    .then(startup);

    $scope.doTranslate = function (key){
      return $translate.instant(key);
    };

    $scope.delete = function (sectionBilan) {
      connect.delete('section_bilan', 'id', sectionBilan.id)
      .then(function () {
        $scope.sectionBilans.remove(sectionBilan.id);
        messenger.info($translate.instant('SECTION_BILAN.DELETE_SUCCESS'));
      });
    };

    $scope.edit = function (sectionBilan) {
      session.action = 'edit';
      session.edit = angular.copy(sectionBilan);
    };

    $scope.new = function () {
      session.action = 'new';
      session.new = {};
    };

    $scope.save = {};

    $scope.save.edit = function () {
      var record = connect.clean(session.edit);
      connect.put('section_bilan', [record], ['id'])
      .then(function (res) {
        messenger.info($translate.instant('SECTION_BILAN.EDIT_SUCCESS'));
        $scope.sectionBilans.put(record);
        session.action = '';
        session.edit = {};
      });
    };

    $scope.save.new = function () {
      var record = connect.clean(session.new);
      connect.post('section_bilan', [record])
      .then(function (res) {
        messenger.info($translate.instant('SECTION_BILAN.NEW_SUCCESS'));
        record.id = res.data.insertId;
        $scope.sectionBilans.post(record);
        session.action = '';
        session.new = {};
      });
    };
  }
]);
