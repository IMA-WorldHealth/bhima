angular.module('bhima.components')
  .component('bhAccountSelect', {
    controller: AccountSelectController ,
    templateUrl : 'partials/templates/bhAccountSelect.tmpl.html',
    bindings: {
      label:                 '@', // label to display
      name:                  '@', // name of the component
      initialValue :         '<', // sets the initial model value
      onUpdate :             '&', // called when the model changes
      required:              '<', // bind the required (for ng-required)
      validationTrigger:     '<', // bind validation trigger,
    }
  });

AccountSelectController.$inject = [ 'AccountService', 'bhConstants', '$scope' ];

/**
 * The Find Account Component
 *
 * Allows an easy way for pages to import account selects
 */
function AccountSelectController(Accounts, bhConstants, $scope) {
  var $ctrl = this;

  // bind the title account
  $ctrl.TITLE_ACCOUNT = bhConstants.accounts.TITLE;

  // default parameters
  $ctrl.label = $ctrl.label || 'TABLE.COLUMNS.ACCOUNT';
  $ctrl.name = $ctrl.name || 'AccountComponentForm';

  // TODO - improve this with caching
  Accounts.read()
    .then(function (accounts) {
      $ctrl.accounts = Accounts.order(accounts);
    });

  $ctrl.onSelect = function onSelect($item) {

    // call the external update method
    $ctrl.onUpdate({ account : $item });

    // set the $bhValue to be picked up by filterFormElements
    var ComponentForm = $scope[$ctrl.name];
    ComponentForm.$bhValue = $item.id;
  };
}

