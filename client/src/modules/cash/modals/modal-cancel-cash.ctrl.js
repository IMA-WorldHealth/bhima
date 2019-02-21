angular.module('bhima.controllers')
  .controller('ModalCancelCashController', ModalCancelCashController);

ModalCancelCashController.$inject = [
  '$filter', '$state', '$uibModalInstance',
  'CashService', 'data', 'VoucherService', 'NotifyService',
];

function ModalCancelCashController($filter, $state, Instance, Cash, data, Vouchers, Notify) {
  const vm = this;

  vm.cancelCash = {};
  vm.submit = submit;
  vm.goToPatientLink = goToPatientLink;
  const $currency = $filter('currency');

  vm.cancel = () => Instance.close(false);

  vm.cancelCash.uuid = data.invoice.uuid;
  vm.patientInvoice = data.invoice;

  Cash.read(data.invoice.uuid)
    .then((response) => {
      vm.cashData = response;

      vm.alertI18nValues = {
        invoiceReference : vm.cashData.reference,
        patientName : vm.cashData.debtorName,
        patientReference : vm.cashData.debtorReference,
        cost : $currency(vm.cashData.amount, vm.cashData.currency_id),
      };
    })
    .catch(Notify.handleError);

  function submit(form) {
    // stop submission if the form is invalid
    if (!form.$invalid) {
      return Vouchers.reverse(vm.cancelCash)
        .then(() => {
          return Instance.close(true);
        })
        .catch(Notify.handleError)
        .finally(() => {
          Instance.close();
        });
    }
    return false;
  }

  // Link to the patient registry
  function goToPatientLink() {
    Instance.close(false);
    $state.go('patientRegistry', {
      filters : [{
        key : 'debtor_uuid',
        value : vm.cashData.debtor_uuid,
        displayValue : vm.cashData.debtorName,
      }],
    });
  }
}
