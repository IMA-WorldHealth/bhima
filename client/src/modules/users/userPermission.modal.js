angular.module('bhima.controllers')
  .controller('UserPermissionModalController', UserPermissionModalController);

UserPermissionModalController.$inject = [
  '$translate', '$http', '$state', 'util', 'UserService', 'NodeTreeService', 'NotifyService'
];


function UserPermissionModalController($translate, $http, $state, util, Users, NT, Notify) {
  var vm = this;

  vm.user = {};   // the user object that is either edited or created

  // bind methods
  vm.submit = submit;
  vm.editPermissions = editPermissions;
  vm.checkboxOffset = checkboxOffset;
  vm.toggleUnitChildren = toggleUnitChildren;
  vm.toggleSuperUserPermissions = toggleSuperUserPermissions;
  vm.toggleParents = toggleParents;
  vm.closeModal = closeModal;

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
      })
      .catch(Notify.handleError);
  }

  // used in the view to set permission's tree padding based on depth
  function checkboxOffset(depth) {
    return {
      'padding-left' : 30 * depth + 'px'
    };
  }

  // loads tree units on demand  Used for assigning user's permissions
  function loadUnits() {
    return $http.get('/units')
    .then(util.unwrapHttpResponse);
  }

  // traverse upwards, toggling parents
  function toggleParents(unit) {
    if(unit.parent !== 0 && unit.checked ){
      var parent = vm.units.filter(function (item) {
        return item.id  === unit.parent;
      });
      parent[0].checked = unit.checked;

      if (parent[0].parent) {
        vm.toggleParents(parent);
      }
    }
  }

  // toggle the selection all child nodes
  function toggleUnitChildren(unit, children) {
    if (!unit.checked) { vm.super = false; }

    if(unit.parent !== 0){
      vm.toggleParents(unit); // traverse upwards, toggling parents
    }

    children.forEach(function (node) {
      node.checked = unit.checked;
      if (node.children) {
        toggleUnitChildren(node, node.children);
      }
    });
  }

  // toggles all permissions to match there super user permission's setting
  function toggleSuperUserPermissions(bool) {
    vm.units.forEach(function (node) {
      node.checked = bool;
    });
  }

  function submit (){
    var permissions = vm.units.filter(function (u) {
        return u.checked;
      })
      .map(function (u) {
        return u.id;
      });

    return Users.updatePermissions(vm.user.id, permissions)
      .then(function () {
        Notify.success('USERS.UPDATED');
        $state.go('users.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }

  function closeModal (){
    $state.go('users.list');
  }

  Users.read($state.params.id)
    .then(function (user) {
      vm.user = user;
      editPermissions(user);
    });
}
