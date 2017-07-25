angular.module('bhima.controllers')
  .controller('SearchFiscalYearModalController', SearchFiscalYearModalController);

// dependencies injections
SearchFiscalYearModalController.$inject = [
  'NotifyService', '$uibModalInstance', 'SearchFilterFormatService', 'FiscalService',
];

function SearchFiscalYearModalController(Notify, Instance, SearchFilterFormat, Fiscal) {
  var vm = this;
  vm.cancel = Instance.close;
  vm.submit = submit;

  // load Fiscal Year Service 
  Fiscal.read(null, { detailed : 1 })
    .then(function (fiscalYears) {
      vm.fiscalYears = fiscalYears;
    })
    .catch(Notify.handleError);

  function submit() {
    Instance.close(vm.bundle);
  }
}
