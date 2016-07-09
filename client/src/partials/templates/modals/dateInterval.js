angular.module('bhima.controllers')
.controller('DateIntervalModalController', DateIntervalModalController);

DateIntervalModalController.$inject = ['$uibModalInstance', 'DateService'];

/**
 * Date Interval Modal
 * This controller permit to select Interval of date
 * it returns the result as dateFrom and dateTo
 */
function DateIntervalModalController (Instance, Dates) {
  var vm = this;

  vm.options = [
    { translateKey : 'FORM.LABELS.TODAY', fn : day },
    { translateKey : 'FORM.LABELS.THIS_WEEK', fn : week },
    { translateKey : 'FORM.LABELS.THIS_MONTH', fn : month },
    { translateKey : 'FORM.LABELS.OTHER', fn : other },
  ];

  // expose to the viewe
  vm.search = search;
  vm.submit = submit;
  vm.close  = close;
  vm.clear  = clear;

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
    vm.selected = selection.translateKey;
    selection.fn();
  }

  function day() {
    vm.dateFrom = Dates.current.day();
    vm.dateTo = new Date();
  }

  function week() {
    vm.dateFrom = Dates.current.week();
    vm.dateTo = new Date();
  }

  function month() {
    vm.dateFrom = Dates.current.month();
    vm.dateTo = new Date();
  }

  function other() {
    vm.dateFrom = new Date(null); // start at the beginning
    vm.dateTo = new Date();
  }

  function clear() {
    vm.dateFrom = null;
    vm.dateTo = null;
  }

  function startup() {
    search(vm.options[0]);
  }
}
