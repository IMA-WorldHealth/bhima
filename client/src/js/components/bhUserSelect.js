angular.module('bhima.components')
  .component('bhUserSelect', {
    templateUrl : 'modules/templates/bhUserSelect.tmpl.html',
    controller  : UserSelectController,
    transclude  : true,
    bindings    : {
      userId           : '<',
      disable          : '<',
      onSelectCallback : '&?',
      required         : '<?',      
    },
  });

UserSelectController.$inject = [
  'UserService', '$scope'
];

/**
 * User selection component
 *
 */
function UserSelectController(Users, $scope) {
  var $ctrl = this;


  $ctrl.$onInit = function onInit() {    
    // fired when an user has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // load all User
    Users.read()
      .then(function (users) {        
        $ctrl.users = users;
      });

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ user : $item });
  };
}
