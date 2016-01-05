angular.module('bhima.controllers')
.controller('config_cotisation', [
  '$scope',
  '$translate',
  '$q',
  '$window',
  'store',
  'connect',
  'messenger',
  'validate',
  'appstate',
  function($scope, $translate, $q, $window, Store, connect, messenger, validate, appstate) {
    var dependencies = {},
	  session = $scope.session = {};
    var isDefined = angular.isDefined;

    // keeps track of state
    var current = $scope.current = {
      state : null,
      config_cotisation : {},
      permissions : [],
      cotisations : [],
      _backup : null
    };



    dependencies.config_cotisations = {
      query : {
        tables: {
          'config_cotisation': {
            columns : ['id', 'label']
          }
        }
      }
    };

    dependencies.cotisations = {
      query : {
        identifier : 'id',
        tables : {
          'cotisation' : {
            columns : ['id', 'label', 'abbr', 'is_employee', 'is_percent', 'value', 'four_account_id', 'six_account_id', 'value']
          }
        }
      }
    };

    dependencies.config_cotisation_item = {
      identifier : 'cotisation_id',
      tables : {
        'config_cotisation_item' : {
          columns : ['id', 'config_cotisation_id', 'cotisation_id']
        }
      }
    };

    // for registration of 'super config_cotisation privileges'
    $scope.super = {};

    $scope.editConfig = function editConfig(config_cotisation) {
      current.config_cotisation = config_cotisation;
      current._backup = angular.copy(config_cotisation);
      current.state = 'edit';
      current.config_cotisation.passwordVerify = current.config_cotisation.password;
    };

    $scope.addUser = function addUser() {
      current.config_cotisation = {};
      current.state = 'add';
    };

    function submitAdd() {
      connect.post('config_cotisation', [connect.clean(current.config_cotisation)])
      .then(function (res) {
        messenger.info($translate.instant('GRADE.SAVE_SUCCES'));
        current.config_cotisation.id = res.data.insertId;
        $scope.config_cotisations.post(current.config_cotisation);
        $scope.editConfig(current.config_cotisation);
		current.state = '';
      });
    }

    function submitEdit() {
      connect.put('config_cotisation', [connect.clean(current.config_cotisation)], ['id'])
      .then(function (res) {
        messenger.success($translate.instant('CONFIG_COTISATION.UPDATE_SUCCES'));
        $scope.config_cotisations.put(current.config_cotisation);
        $scope.editConfig(current.config_cotisation);
		current.state = '';
      });
    }


    function submitConfig() {
      var cotisations = $scope.cotisations.data,
          removals  = [],
          additions = [];

      cotisations.forEach(function (cotisation) {
        var isOld = !!current.cotisations.get(cotisation.id);

        if (!!cotisation.checked && !current.cotisations.get(cotisation.id)) {
          additions.push({ cotisation_id : cotisation.id, config_cotisation_id : current.config_cotisation.id });
        }

        if (!cotisation.checked && !!current.cotisations.get(cotisation.id)) {
          // id here is the config_cotisation_item id, indexed by the
          // cotisation.id.  It is confusing, I know.
          var id = current.cotisations.get(cotisation.id).id;
          removals.push(id);
        }
      });

      var promises = removals.map(function (id) {
        return connect.delete('config_cotisation_item', 'id', id);
      });

      // add the (newly) checked cotisation permissions
      if (additions.length > 0) { promises.push(connect.post('config_cotisation_item', additions)); }

      $q.all(promises)
      .then(function () {
        $scope.config(current.config_cotisation);
        messenger.success($translate.instant('CONFIG_COTISATION.UPDATE_SUCCES'));
      });
    }

    $scope.clearPass = function clearPass() {
      // when a config_cotisation attempts a new password, clear the old one.
      current.config_cotisation.passwordVerify = '';
      $scope.validatePassword();
    };

    // deleting a config_cotisation
    $scope.removeConfig = function removeConfig(config_cotisation) {

      var result = confirm($translate.instant('CONFIG_COTISATION.CONFIRM'));
      if (result) {
        connect.delete('config_cotisation', 'id', config_cotisation.id)
        .then(function () {
          messenger.info($translate.instant('CONFIG_COTISATION.DELETE_SUCCESS'));
          $scope.config_cotisations.remove(config_cotisation.id);
        });
      }
    };

    $scope.config = function config(config_cotisation) {
      current.state = 'cotisations';
      $scope.super.cotisations = false;
      current.config_cotisation = config_cotisation;
      dependencies.config_cotisation_item.where =
        ['config_cotisation_item.config_cotisation_id=' + config_cotisation.id];

      connect.req(dependencies.config_cotisation_item)
      .then(function (store) {
        current.cotisations = store;
        current._backup = angular.copy(store.data);
        setSavedProjectPermissions();
      });
    };


    function setSavedProjectPermissions() {
      if (!current.cotisations.data || !$scope.cotisations) { return; }
      var cotisations = $scope.cotisations.data;

      cotisations.forEach(function (proj) {
        // loop through permissions and check each cotisation that
        // the config_cotisation has permission to.
        proj.checked = !!current.cotisations.get(proj.id);
      });
    }

    $scope.toggleSuperProjects = function toggleSuperProjects(bool) {
      $scope.cotisations.data.forEach(function (cotisation) {
        cotisation.checked = bool;
      });
    };

    $scope.deselectAllProjects = function deselectAllProjects(bool) {
      if (!bool) { $scope.super.cotisations = false; }
    };

    $scope.submit = function submit() {
      switch (current.state) {
        case 'edit' :
          submitEdit();
          break;
        case 'add' :
          submitAdd();
          break;
        case 'cotisations' :
          submitConfig();
          break;
        default:
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
          break;
      }
    };

    $scope.reset = function reset() {
      switch (current.state) {
        case 'edit':
          current.config_cotisation = current._backup;
          break;
        case 'add':
          current.config_cotisation = {};
          current._backup = {};
          break;
        case 'cotisations':
          current.cotisations = current._backup;
          break;
        default:
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
          break;
      }
    };

    // startup
    validate.process(dependencies, ['config_cotisations', 'cotisations'])
    .then(function (models) {
      angular.extend($scope, models);
      // order the data
    });

  }
]);
