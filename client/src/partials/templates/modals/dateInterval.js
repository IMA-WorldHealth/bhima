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

  vm.options = [
    { label : 'FORM.LABELS.TODAY', fn : day },
    { label : 'FORM.LABELS.THIS_WEEK', fn : week },
    { label : 'FORM.LABELS.THIS_MONTH', fn : month },
    { label : 'FORM.LABELS.OTHER', fn : other },
  ];

  // expose to the viewe
  vm.search = search;
  vm.submit = submit;
  vm.close  = close;

  // start up the modal
  startup();

  // submit
  function submit() {
    Instance.close({ dateFrom: vm.dateFrom, dateTo: vm.dateTo });
  }

  // close
  function close() {
    Instance.dismiss();
  }

  function search (selection) {
    vm.selected = selection.label;
    selection.fn();
  }

  function day () {
    vm.dateFrom = new Date();
    vm.dateTo = new Date();
  }

  function week () {
    vm.dateFrom = new Date();
    vm.dateTo = new Date();
    vm.dateFrom.setDate(vm.dateTo.getDate() - vm.dateTo.getDay());
  }

  function other () {
    vm.dateFrom = new Date(null); // start at the beginning
    vm.dateTo = new Date();
  }

  function month () {
    vm.dateFrom = new Date();
    vm.dateTo = new Date();
    vm.dateFrom.setDate(1);
  }

  function startup() {
    search(vm.options[0]);
  }
}
