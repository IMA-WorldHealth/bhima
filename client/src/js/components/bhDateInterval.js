/**
 * @name bhDateInterval
 * @description
 * The `bhDateInterval` component provide a mean to select dates plage between
 * two dates. The dates values returned are send to dates models given in
 * date-from and date-to attributes
 *
 * @example
 * ```html
 * <bh-date-interval date-from="$MyCtrl.dateFrom" date-to="$MyCtrl.dateTo" >
 * </bh-date-interval>
 * ```
 */
angular.module('bhima.components').component('bhDateInterval', {
  templateUrl : '/partials/templates/bhDateInterval.tmpl.html',
  controller : bhDateInterval,
  bindings : {
    dateFrom : '=',
    dateTo : '='
  }
});

// dependencies injection
bhDateInterval.$inject = ['DateService'];

// controller definition
function bhDateInterval(Dates) {
  var vm = this;

  vm.options = [
    { translateKey : 'FORM.LABELS.TODAY', fn : day },
    { translateKey : 'FORM.LABELS.THIS_WEEK', fn : week },
    { translateKey : 'FORM.LABELS.THIS_MONTH', fn : month },
    { translateKey : 'FORM.LABELS.THIS_YEAR', fn : year }
  ];

  // expose to the viewe
  vm.search = search;
  vm.clear  = clear;

  // start up the modal
  startup();

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
    vm.dateTo = moment().endOf('month').toDate();
  }

  function year() {
    vm.dateFrom = Dates.current.year();
    vm.dateTo = moment().endOf('year').toDate();
  }

  function clear() {
    vm.dateFrom = null;
    vm.dateTo = null;
  }

  function startup() {
    // set today as default date plage value 
    if (!vm.dateFrom && !vm.dateTo) {
      search(vm.options[0]);
    }
  }

}
