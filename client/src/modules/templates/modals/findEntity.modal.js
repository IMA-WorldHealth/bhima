angular.module('bhima.controllers')
.controller('FindEntityModalController', FindEntityModalController);

FindEntityModalController.$inject = [
  '$uibModalInstance','DebtorService', 'CreditorService', '$timeout',
];

/**
 * Find Entity Modal Controller
 *
 * This controller provides bindings for the find entity modal.
 */
function FindEntityModalController(Instance, Debtor, Creditor, $timeout) {
  var vm = this;

  vm.result = {};

  vm.types = [
    { code: 'D', label: 'VOUCHERS.COMPLEX.DEBTOR' },
    { code: 'C', label: 'VOUCHERS.COMPLEX.CREDITOR' },
  ];

  vm.selectedTypeLabel = 'VOUCHERS.COMPLEX.DEB_CRED';

  vm.selectEntity = selectEntity;
  vm.setType = setType;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.refresh = refresh;

  Debtor.read()
  .then(function (list) {
    vm.debtorList = list;
  });

  Creditor.read()
  .then(function (list) {
    vm.creditorList = list;
  });

  function selectEntity(item) {
    vm.result = {
      uuid     : item.uuid,
      label    : item.text,
      type     : vm.selectedType.code,
      hrEntity : item.hr_entity,
    };
  }

  function setType(type) {
    vm.selectedType = type;
    vm.selectedTypeLabel = type.label;

    vm.entities = vm.selectedType.code === 'D' ? vm.debtorList :
      vm.selectedType.code === 'C' ? vm.creditorList : [];

    vm.placeholder = vm.selectedType.code === 'D' ? 'FORM.PLACEHOLDERS.DEBTOR' :
      vm.selectedType.code === 'C' ? 'FORM.PLACEHOLDERS.CREDITOR' : '';
  }

  function refresh() {
    vm.result = {};
  }

  function submit() {
    // the $timeout fix the $digest error
    $timeout(function() {
      Instance.close(vm.result);
    }, 0, false);
  }

  function cancel() {
    // the $timeout fix the $digest error
    $timeout(function() {
      Instance.close();
    }, 0, false);
  }

}
