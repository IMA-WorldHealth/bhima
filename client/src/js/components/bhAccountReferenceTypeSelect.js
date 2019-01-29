angular.module('bhima.components')
  .component('bhAccountReferenceTypeSelect', {
    templateUrl : 'modules/templates/bhAccountReferenceTypeSelect.tmpl.html',
    controller  : AccountReferenceTypeSelectController,
    transclude  : true,
    bindings    : {
      referenceTypeId   : '<?',
      onSelectCallback  : '&',
      disable           : '<?',
    },
  });

AccountReferenceTypeSelectController.$inject = ['AccountReferenceTypeService', '$translate'];

/**
 * Account Reference Type selection component
 */
function AccountReferenceTypeSelectController(AccountReferenceType, $translate) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    AccountReferenceType.read()
      .then(accountReferenceTypes => {
        accountReferenceTypes.forEach((item) => {
          item.label = $translate.instant(item.label);
        });

        $ctrl.accountReferenceTypes = accountReferenceTypes;
      });
  };

  $ctrl.onSelect = accountReferenceType => $ctrl.onSelectCallback({ accountReferenceType });
}
