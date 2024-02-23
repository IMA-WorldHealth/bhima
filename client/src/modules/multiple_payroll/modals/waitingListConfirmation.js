angular.module('bhima.controllers')
  .controller('ModalWaitingListConfirmationController', ModalWaitingListConfirmationController);

ModalWaitingListConfirmationController.$inject = [
  'data', 'bhConstants', 'SessionService', '$uibModalInstance',
];

function ModalWaitingListConfirmationController(
  data, bhConstants, Session, Instance,
) {
  const vm = this;
  vm.Constants = bhConstants;
  vm.submit = submit;
  vm.cancel = () => Instance.close(false);

  vm.enterprise = Session.enterprise;
  vm.employeesNumber = data.employeesNumber;
  vm.paiementPeriodLabel = data.paiementPeriodLabel;
  vm.totalNetSalary = data.totalNetSalary;

  function submit() {
    Instance.close(true);
  }
}
