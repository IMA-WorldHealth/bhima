angular.module('bhima.controllers')
  .controller('PriceListModalController', PriceListModalController);

PriceListModalController.$inject = [
  'data', '$uibModalInstance', 'NotifyService',
  'PriceListService', 'SessionService',
];

function PriceListModalController(data, Instance, Notify, PriceList, Session) {
  const vm = this;

  const priceList = data || { enterprise_id : Session.enterprise.id };
  vm.priceList = angular.copy(priceList);

  vm.isCreate = !angular.isDefined(vm.priceList.uuid);
  vm.submit = submit;
  vm.close = Instance.close;

  function submit(form) {
    if (form.$invalid) {
      return Notify.danger('FORM.ERRORS.HAS_ERRORS');
    }

    const promise = vm.isCreate
      ? PriceList.create(vm.priceList)
      : PriceList.update(vm.priceList.uuid, vm.priceList);

    return promise
      .then(() => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}
