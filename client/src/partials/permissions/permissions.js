angular.module('bhima.controllers')
.controller('PermissionsController', PermissionsController);

PermissionsController.$inject = [
  '$window', '$translate', '$http', '$uibModal', 'util', 'SessionService', 'UserService',
  'ProjectService', 'NodeTreeService'
];

/** 
 * Users and Permission Controller 
 * 
 * This module is responsible for handling the creation
 * of users and assigning permissions to existing modules.
 *
 * @todo Password insecure alert or not
 */
function PermissionsController($window, $translate, $http, $uibModal, util, Session, Users, Projects, NT) {
  var vm = this;

  var editTemplate =
    '<div style="margin: 0px 5px 5px 5px;"><a class="btn btn-sm btn-default btn-block" ng-click="grid.appScope.edit(row.entity)">{{ "FORM.BUTTONS.EDIT" | translate }}</a></div>';
  
  var permissionTemplate = 
    '<div style="margin: 0px 5px 5px 5px;"><a class="btn btn-sm btn-default btn-block" ng-click="grid.appScope.editPermissions(row.entity)">{{ "FORM.BUTTONS.EDIT_PERMISSIONS" | translate }}</a></div>';

  // options for the UI grid
  vm.uiGridOptions = {
    appScopeProvider : vm, // ensure that the controller's `this` variable is bound to appScope
    enableColumnMenus : false,
    columnDefs : [
      { field : 'displayname', name : 'Display Name' },
      { field : 'username', name : 'User Name' },
      { name : 'edit', displayName : '', cellTemplate: editTemplate, enableSorting : false },
      { name : 'permission', displayName : '', cellTemplate: permissionTemplate, enableSorting : false }
    ],
    enableSorting : true
  };

  // the user object that is either edited or created
  vm.user = {};

  /** @todo manage state without strings */
  vm.state = 'default'; // this is default || create || update

  // bind methods
  vm.setState = setState;
  vm.submit = submit;
  vm.validPassword = validPassword;
  vm.edit = edit;
  vm.editPermissions = editPermissions;
  vm.setPasswordModal = setPasswordModal;
  vm.checkboxOffset = checkboxOffset;
  vm.toggleUnitChildren = toggleUnitChildren;
  vm.toggleSuperUserPermissions = toggleSuperUserPermissions;

  /* ------------------------------------------------------------------------ */

  // TODO
  function handler(error) {
    throw error;
  }

  // sets the module view state
  function setState(state) {
    vm.state = state;
    vm.super = 0; // reset super user determination between states
    vm.user = {}; // reset users between state changes
    vm.formMessage = undefined; // reset form messages
  }

  // this is the new user
  function edit(user) {

    // load the user
    Users.read(user.id)
    .then(function (user) {
      setState('update');
      vm.user = user;
    })
    .catch(handler)
    .finally();
  }

  // loads the permissions tree for a given user.
  function editPermissions(user) {
    var units;

    // load the tree units
    loadUnits()
    .then(function (data) {

      // unit value comparison function
      function cmp(nodeA, nodeB) {
        var a = $translate.instant(nodeA.key);
        var b = $translate.instant(nodeB.key);
        return a > b ? 1 : -1;
      }

      // build tree before flattening
      var tree = NT.buildNodeTree(data);
      units = NT.flattenInPlace(tree, cmp);

      // make sure that we have the proper permissions selected
      return Users.permissions(user.id);
    })
    .then(function (permissions) {

      // loop through units, giving permissions in line with those in the
      // database
      permissions.forEach(function (object) {
        units.forEach(function (unit) {
          if (unit.id === object.unit_id) {
            unit.checked = true;
          }
        });
      });

      vm.units = units;
      setState('permissions');

      return Users.read(user.id);
    })
    .then(function (user) {
      vm.user = user;
    })
    .catch(handler)
    .finally();
  }

  // used in the view to set permission's tree padding based on depth
  function checkboxOffset(depth) {
    return {
      'padding-left' : 30 * depth + 'px'
    };
  }

  // make sure that the passwords exist and match.
  function validPassword() {
    return vm.user.password &&
      vm.user.passwordVerify &&
      vm.user.password.length &&
      vm.user.passwordVerify.length &&
      vm.user.password === vm.user.passwordVerify;
  }

  // opens a new modal to let the user set a password
  function setPasswordModal() {
    $uibModal.open({
      templateUrl: 'partials/permissions/permissionsPasswordModalTemplate.html',
      size : 'md',
      animation : true,
      controller:  'PermissionsPasswordModalController as ModalCtrl',
      resolve:     {
        user:      vm.user
      }
    });
  }

  // submit the data to the server from all three forms (update, create,
  // permissions)
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var messages = {
      'create' : 'FORM.INFOS.CREATE_SUCCESS',
      'update' : 'FORM.INFOS.UPDATE_SUCCESS',
      'permissions' : 'FORM.INFOS.UPDATE_SUCCESS'
    };

    // decide how to submit data to the server based on state.
    switch (vm.state) {
      case 'create':
        promise = Users.create(vm.user);
        break;
      case 'update':
        promise = Users.update(vm.user.id, vm.user);
        break;
      case 'permissions':
        var permissions = vm.units.filter(function (u) {
          return u.checked;
        })
        .map(function (u) {
          return u.id;
        });

        promise = Users.updatePermissions(vm.user.id, permissions);
        break;
      default:
        break;
    }

    promise.then(function (data) {
      var msg = messages[vm.state];

      // go back to default state
      setState('success');

      // display the correct state-based success message
      vm.formMessage = { code : msg };
    })
    .catch(function (res) {
      vm.formMessage = res.data;
    });
  }

  // load user grid
  function loadGrid() {
    Users.read().then(function (users) {
      vm.uiGridOptions.data = users;
    });
  }

  // called on modules start
  function startup() {

    loadGrid();

    // load projects
    Projects.read().then(function (data) {
      vm.projects = data;
    });
  }

  // loads tree units on demand  Used for assigning user's permissions
  function loadUnits() {
    return $http.get('/units')
    .then(util.unwrapHttpResponse);
  }

  // toggle the selection all child nodes
  function toggleUnitChildren(unit, children) {
    children.forEach(function (node) {
      node.checked = unit.checked;
      if (node.children) {
        toggleUnitChildren(node, node.children);
      }
    });
  }

  // toggles all permissions to match there super user permission's setting
  function toggleSuperUserPermissions() {
    vm.units.forEach(function (node) {
      node.checked = vm.super;
      if (node.children) {
        toggleUnitChildren(node, node.children);
      }
    });
  }

  // fire up the module
  startup();
}
