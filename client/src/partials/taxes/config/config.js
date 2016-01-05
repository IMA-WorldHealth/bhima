angular.module('bhima.controllers')
.controller('config_tax', [
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
      config_tax : {},
      permissions : [],
      taxs : [],
      _backup : null
    };



    dependencies.config_taxs = {
      query : {
        tables: {
          'config_tax': {
            columns : ['id', 'label']
          }
        }
      }
    };

    dependencies.taxs = {
      query : {
        identifier : 'id',
        tables : {
          'tax' : {
            columns : ['id', 'label', 'abbr', 'is_employee', 'is_percent', 'value', 'four_account_id', 'six_account_id', 'value']
          }
        }
      }
    };

    dependencies.config_tax_item = {
      identifier : 'tax_id',
      tables : {
        'config_tax_item' : {
          columns : ['id', 'config_tax_id', 'tax_id']
        }
      }
    };

    // for registration of 'super config_tax privileges'
    $scope.super = {};

    $scope.editConfig = function editConfig(config_tax) {
      current.config_tax = config_tax;
      current._backup = angular.copy(config_tax);
      current.state = 'edit';
      current.config_tax.passwordVerify = current.config_tax.password;
    };

    $scope.addUser = function addUser() {
      current.config_tax = {};
      current.state = 'add';
    };

    function submitAdd() {
      connect.post('config_tax', [connect.clean(current.config_tax)])
      .then(function (res) {
        messenger.info($translate.instant('GRADE.SAVE_SUCCES'));
        current.config_tax.id = res.data.insertId;
        $scope.config_taxs.post(current.config_tax);
        $scope.editConfig(current.config_tax);
		current.state = '';
      });
    }

    function submitEdit() {
	  console.log(current.config_tax);
      connect.put('config_tax', [connect.clean(current.config_tax)], ['id'])
      .then(function (res) {
        messenger.success($translate.instant('CONFIG_TAX.UPDATE_SUCCES'));
        $scope.config_taxs.put(current.config_tax);
        $scope.editConfig(current.config_tax);
		current.state = '';
      });
    }


    function submitConfig() {
      var taxs = $scope.taxs.data,
          removals  = [],
          additions = [];

      taxs.forEach(function (tax) {
		console.log(current.taxs.get(tax.id));
        var isOld = !!current.taxs.get(tax.id);

        if (!!tax.checked && !current.taxs.get(tax.id)) {
          additions.push({ tax_id : tax.id, config_tax_id : current.config_tax.id });
        }

        if (!tax.checked && !!current.taxs.get(tax.id)) {
          // id here is the config_tax_item id, indexed by the
          // tax.id.  It is confusing, I know.
          var id = current.taxs.get(tax.id).id;
          removals.push(id);
        }
      });

      var promises = removals.map(function (id) {
        return connect.delete('config_tax_item', 'id', id);
      });

      // add the (newly) checked tax permissions
      if (additions.length > 0) { promises.push(connect.post('config_tax_item', additions)); }

      $q.all(promises)
      .then(function () {
        $scope.config(current.config_tax);
        messenger.success($translate.instant('CONFIG_TAX.UPDATE_SUCCES'));
      });
    }

    $scope.clearPass = function clearPass() {
      // when a config_tax attempts a new password, clear the old one.
      current.config_tax.passwordVerify = '';
      $scope.validatePassword();
    };

    // deleting a config_tax
    $scope.removeConfig = function removeConfig(config_tax) {

      var result = confirm($translate.instant('CONFIG_TAX.CONFIRM'));
      if (result) {
        connect.delete('config_tax', 'id', config_tax.id)
        .then(function () {
          messenger.info($translate.instant('CONFIG_TAX.DELETE_SUCCESS'));
          $scope.config_taxs.remove(config_tax.id);
        });
      }
    };

    $scope.config = function config(config_tax) {
      current.state = 'taxs';
      $scope.super.taxs = false;
      current.config_tax = config_tax;
      dependencies.config_tax_item.where =
        ['config_tax_item.config_tax_id=' + config_tax.id];

      connect.req(dependencies.config_tax_item)
      .then(function (store) {
        current.taxs = store;
        current._backup = angular.copy(store.data);
        setSavedProjectPermissions();
      });
    };


    function setSavedProjectPermissions() {
      if (!current.taxs.data || !$scope.taxs) { return; }
      var taxs = $scope.taxs.data;

      taxs.forEach(function (proj) {
        // loop through permissions and check each tax that
        // the config_tax has permission to.
		console.log(current.taxs.get(proj.id));
        proj.checked = !!current.taxs.get(proj.id);
      });
    }

    $scope.toggleSuperProjects = function toggleSuperProjects(bool) {
      $scope.taxs.data.forEach(function (tax) {
        tax.checked = bool;
      });
    };

    $scope.deselectAllProjects = function deselectAllProjects(bool) {
      if (!bool) { $scope.super.taxs = false; }
    };

    $scope.submit = function submit() {
      switch (current.state) {
        case 'edit' :
          submitEdit();
          break;
        case 'add' :
          submitAdd();
          break;
        case 'taxs' :
          submitConfig();
          break;
        default:
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
      }
    };

    $scope.reset = function reset() {
      switch (current.state) {
        case 'edit':
          current.config_tax = current._backup;
          break;
        case 'add':
          current.config_tax = {};
          current._backup = {};
          break;
        case 'taxs':
          current.taxs = current._backup;
          break;

        default:
          console.log('[ERR]', 'I don\'t know what I\'m doing!');
          break;
      }
    };

    // startup
    validate.process(dependencies, ['config_taxs', 'taxs'])
    .then(function (models) {
      angular.extend($scope, models);
      // order the data
    });

  }
]);
