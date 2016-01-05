angular.module('bhima.controllers')
.controller('sectionResultat', [
  '$scope',
  '$translate',
  'validate',
  'connect',
  'messenger',
  function ($scope, $translate, validate, connect, messenger) {
    var dependencies = {},
        session = $scope.session = {};

    dependencies.sectionResultats = {
      query : {
        identifier : 'id',
        tables : {
          'section_resultat' : {
            columns : ['id', 'text', 'is_charge', 'position']
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

    $scope.delete = function (sectionResultat) {
      connect.delete('section_resultat', 'id', sectionResultat.id)
      .then(function () {
        $scope.sectionResultats.remove(sectionResultat.id);
        messenger.info($translate.instant('SECTION_RESULTAT.DELETE_SUCCESS'));
      });
    };

    $scope.edit = function (sectionResultat) {
      session.action = 'edit';
      session.edit = angular.copy(sectionResultat);
    };

    $scope.new = function () {
      session.action = 'new';
      session.new = {};
    };

    $scope.save = {};

    $scope.save.edit = function () {
      var record = connect.clean(session.edit);
      connect.put('section_resultat', [record], ['id'])
      .then(function (res) {
        messenger.info($translate.instant('SECTION_RESULTAT.EDIT_SUCCESS'));
        $scope.sectionResultats.put(record);
        session.action = '';
        session.edit = {};
      });
    };

    $scope.save.new = function () {
      var record = connect.clean(session.new);
      connect.post('section_resultat', [record])
      .then(function (res) {
        messenger.info($translate.instant('SECTION_RESULTAT.NEW_SUCCESS'));
        record.id = res.data.insertId;
        $scope.sectionResultats.post(record);
        session.action = '';
        session.new = {};
      });
    };
  }
]);
