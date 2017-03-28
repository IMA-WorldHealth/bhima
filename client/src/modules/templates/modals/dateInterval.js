angular.module('bhima.controllers')
.controller('DateIntervalModalController', DateIntervalModalController);

DateIntervalModalController.$inject = ['$uibModalInstance'];

/**
 * Date Interval Modal
 * This controller permit to select Interval of date
 * it returns the result as dateFrom and dateTo
 */
function DateIntervalModalController (Instance) {
  var vm = this;

  // expose to the viewe
  vm.submit = submit;
  vm.close  = close;

  // submit
  function submit() {
    Instance.close({ dateFrom: vm.dateFrom, dateTo: vm.dateTo });
  }

  // close
  function close() {
    Instance.close();
  }

}
