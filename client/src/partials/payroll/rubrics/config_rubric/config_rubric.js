angular.module('bhima.controllers')
.controller('config_rubric', [
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
      config_rubric : {},
      permissions : [],
      rubrics : [],
      _backup : null
    };

    var valid = $scope.valid = {
      password : false
    };


    dependencies.config_rubrics = {
      query : {
        tables: {
          'config_rubric': {
            columns : ['id', 'label']
          }
        }
      }
    };

    dependencies.rubrics = {
      query : {
        identifier : 'id',
        tables : {
          'rubric' : {
            columns : ['id', 'label', 'is_discount', 'is_percent', 'value']
          }
        }
      }
    };

    dependencies.config_rubric_item = {
      identifier : 'rubric_id',
      tables : {
        'config_rubric_item' : {
          columns : ['id', 'config_rubric_id', 'rubric_id']
        }
      }
    };

    // for registration of 'super config_rubric privileges'
    $scope.super = {};

    $scope.editConfig = function editConfig(config_rubric) {
      current.config_rubric = config_rubric;
      current._backup = angular.copy(config_rubric);
      current.state = 'edit';
      current.config_rubric.passwordVerify = current.config_rubric.password;
    };

    $scope.addUser = function addUser() {
      current.config_rubric = {};
      current.state = 'add';
    };

    function submitAdd() {
      connect.post('config_rubric', [connect.clean(current.config_rubric)])
      .then(function (res) {
        messenger.info($translate.instant('GRADE.SAVE_SUCCES'));
        current.config_rubric.id = res.data.insertId;
        $scope.config_rubrics.post(current.config_rubric);
        $scope.editConfig(current.config_rubric);
		current.state = '';
      });
    }

    function submitEdit() {
	  console.log(current.config_rubric);
      connect.put('config_rubric', [connect.clean(current.config_rubric)], ['id'])
      .then(function (res) {
        messenger.success($translate.instant('CONFIG_RUBRIC.UPDATE_SUCCES'));
        $scope.config_rubrics.put(current.config_rubric);
        $scope.editConfig(current.config_rubric);
		current.state = '';
      });
    }


    function submitConfig() {
      var rubrics = $scope.rubrics.data,
          removals  = [],
          additions = [];

      rubrics.forEach(function (rubric) {
		console.log(current.rubrics.get(rubric.id));
        var isOld = !!current.rubrics.get(rubric.id);

        if (!!rubric.checked && !current.rubrics.get(rubric.id)) {
          additions.push({ rubric_id : rubric.id, config_rubric_id : current.config_rubric.id });
        }

        if (!rubric.checked && !!current.rubrics.get(rubric.id)) {
          // id here is the config_rubric_item id, indexed by the
          // rubric.id.  It is confusing, I know.
          var id = current.rubrics.get(rubric.id).id;
          removals.push(id);
        }
      });

      var promises = removals.map(function (id) {
        return connect.delete('config_rubric_item', 'id', id);
      });
     
      // add the (newly) checked rubric permissions
      if (additions.length > 0) { promises.push(connect.post('config_rubric_item', additions)); }

      $q.all(promises)
      .then(function () {
        $scope.config(current.config_rubric);
        messenger.success($translate.instant('CONFIG_RUBRIC.UPDATE_SUCCES'));
      });
    }

    $scope.clearPass = function clearPass() {
      // when a config_rubric attempts a new password, clear the old one.
      current.config_rubric.passwordVerify = '';
      $scope.validatePassword();
    };

    // deleting a config_rubric
    $scope.removeConfig = function removeConfig(config_rubric) {

      var result = confirm($translate.instant('CONFIG_RUBRIC.CONFIRM'));
      if (result) {
        connect.delete('config_rubric', 'id', config_rubric.id)
        .then(function () {
          messenger.info($translate.instant('CONFIG_RUBRIC.DELETE_SUCCESS'));
          $scope.config_rubrics.remove(config_rubric.id);
        });
      }
    };

    $scope.config = function config(config_rubric) {
      current.state = 'rubrics';
      $scope.super.rubrics = false;
      current.config_rubric = config_rubric;
      dependencies.config_rubric_item.where =
        ['config_rubric_item.config_rubric_id=' + config_rubric.id];

      connect.req(dependencies.config_rubric_item)
      .then(function (store) {
        current.rubrics = store;
        current._backup = angular.copy(store.data);
        setSavedProjectPermissions();
      });
    };


    function setSavedProjectPermissions() {
      if (!current.rubrics.data || !$scope.rubrics) { return; }
      var rubrics = $scope.rubrics.data;

      rubrics.forEach(function (proj) {
        // loop through permissions and check each rubric that
        // the config_rubric has permission to.
		console.log(current.rubrics.get(proj.id));
        proj.checked = !!current.rubrics.get(proj.id);
      });
    }

    $scope.toggleSuperProjects = function toggleSuperProjects(bool) {
      $scope.rubrics.data.forEach(function (rubric) {
        rubric.checked = bool;
      });
    };

    $scope.deselectAllProjects = function deselectAllProjects(bool) {
      if (!bool) { $scope.super.rubrics = false; }
    };

    $scope.submit = function submit() {
      switch (current.state) {
        case 'edit' :
          submitEdit();
          break;
        case 'add' :
          submitAdd();
          break;
        case 'rubrics' :
          submitConfig();
          break;
        default:
          console.log('current.state', current.state);
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
      }
    };

    $scope.reset = function reset() {
      switch (current.state) {
        case 'edit':
          current.config_rubric = current._backup;
          break;
        case 'add':
          current.config_rubric = {};
          current._backup = {};
          break;
        case 'rubrics':
          current.rubrics = current._backup;
          break;

        default:
          console.log('current.state', current.state);
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
          break;
      }
    };

    // startup
    validate.process(dependencies, ['config_rubrics', 'rubrics'])
    .then(function (models) {
      angular.extend($scope, models);
      // order the data
    });
	
  }
]);
