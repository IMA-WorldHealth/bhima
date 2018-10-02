angular.module('bhima.components')
  .component('bhUserSelect', {
    templateUrl : 'modules/templates/bhUserSelect.tmpl.html',
    controller  : UserSelectController,
    transclude  : true,
    bindings    : {
      userId           : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',
    },
  });

UserSelectController.$inject = [
  'UserService',
];

/**
 * User selection component
 *
 */
function UserSelectController(Users) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when an user has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'UserForm';

    // load all User
    Users.read()
      .then((users) => {
        $ctrl.users = users;
      });

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ user : $item });
  };
}
