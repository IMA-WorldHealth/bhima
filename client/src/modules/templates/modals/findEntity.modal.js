angular.module('bhima.controllers')
  .controller('FindEntityModalController', FindEntityModalController);

FindEntityModalController.$inject = [
  '$uibModalInstance', 'DebtorService', 'CreditorService', '$timeout',
];

/**
 * Find Entity Modal Controller
 *
 * This controller provides bindings for the find entity modal.
 *
 * TODO(@jniles) - rewrite this modal to use a LIKE query.
 */
function FindEntityModalController(Instance, Debtors, Creditors, $timeout) {
  const vm = this;

  vm.result = {};

  vm.types = [
    { code : 'D', label : 'VOUCHERS.COMPLEX.DEBTOR' },
    { code : 'C', label : 'VOUCHERS.COMPLEX.CREDITOR' },
  ];

  vm.selectedTypeLabel = 'VOUCHERS.COMPLEX.DEB_CRED';

  vm.selectEntity = selectEntity;
  vm.setType = setType;
  vm.submit = submit;
  vm.cancel = Instance.close;
  vm.refresh = refresh;

  Debtors.read()
    .then(debtors => {
      vm.debtorList = debtors;
    });

  Creditors.read()
    .then((creditors) => {
      vm.creditorList = creditors;
    });


  function selectEntity(item) {
    vm.result = {
      uuid     : item.uuid,
      label    : item.text,
      type     : vm.selectedType.code,
      hrEntity : item.hrEntity,
    };
  }

  function setType(type) {
    vm.selectedType = type;
    vm.selectedTypeLabel = type.label;

    const isDebtor = vm.selectedType.code === 'D';

    if (isDebtor) {
      vm.entities = vm.debtorList;
      vm.placeholder = 'FORM.PLACEHOLDERS.DEBTOR';
    } else {
      vm.entities = vm.creditorList;
      vm.placeholder = 'FORM.PLACEHOLDERS.CREDITOR';
    }
  }

  function refresh() {
    vm.result = {};
  }

  function submit() {
    // the $timeout fix the $digest error
    $timeout(() => {
      Instance.close(vm.result);
    }, 0, false);
  }

  // default to the debtor type
  setType(vm.types[0]);
}
