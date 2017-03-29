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
angular.module('bhima.components')
  .component('bhDateInterval', {
    templateUrl : '/modules/templates/bhDateInterval.tmpl.html',
    controller : bhDateInterval,
    bindings : {
      validationTrigger : '<', // validation trigger action
      dateFrom : '=',          // date from
      dateTo : '=',            // date to
      required : '<',          // true or false
      onChange : '<',          // on change action
      mode : '@'               // the date mode (day|month|year)
    }
  });

// dependencies injection
bhDateInterval.$inject = ['DateService', 'moment', 'bhConstants'];

// controller definition
function bhDateInterval(Dates, moment, bhConstants) {
  var vm = this;

  // expose to the viewe
  vm.search = search;
  vm.clear = clear;

  vm.$onInit = function $onInit() {
    vm.options = [
      { translateKey: 'FORM.LABELS.TODAY', fn: day, range: 'day' },
      { translateKey: 'FORM.LABELS.THIS_WEEK', fn: week, range: 'week' },
      { translateKey: 'FORM.LABELS.THIS_MONTH', fn: month, range: 'month' },
      { translateKey: 'FORM.LABELS.THIS_YEAR', fn: year, range: 'year' },
    ];

    vm.dateFormat = bhConstants.dayOptions.format;

    vm.pickerOptions = { showWeeks: false };

    // start up the modal
    startup();
  };

  function search(selection) {
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
    delete vm.dateFrom;
    delete vm.dateTo;
  }

  function startup() {
    var option;

    // set today as default date plage value
    if (!vm.dateFrom && !vm.dateTo) {
      search(vm.options[0]);
    }

    option = ['day', 'week', 'month', 'year'].indexOf(vm.mode);

    // set the default option according the mode
    if (option > -1) {
      search(vm.options[option]);
      vm.pickerOptions = vm.mode;
    }

    // set clean mode
    if (vm.mode === 'clean') {
      clear();
    }
  }
}
