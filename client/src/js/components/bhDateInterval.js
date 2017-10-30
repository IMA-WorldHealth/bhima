/**
 * @name bhDateInterval
 * @description
 * The `bhDateInterval` component provide a mean to select dates plage between
 * two dates. The dates values returned are send to dates models given in
 * date-from and date-to attributes
 *
 * @example
 * ```html
 * <bh-date-interval date-from="$MyCtrl.dateFrom" date-to="$MyCtrl.dateTo">
 * </bh-date-interval>
 * ```
 */
angular.module('bhima.components')
  .component('bhDateInterval', {
    templateUrl: '/modules/templates/bhDateInterval.tmpl.html',
    controller: bhDateInterval,
    bindings : {
      validationTrigger : '<', // validation trigger action
      dateFrom : '=', // date from
      dateTo : '=', // date to
      dateId : '@?', // date identifier
      required : '<?', // true or false
      onChange : '<?', // on change action
      label : '@?',
      mode : '@?', // the date mode (day|month|year)
    },
  });

// dependencies injection
bhDateInterval.$inject = ['moment', 'bhConstants'];

// controller definition
function bhDateInterval(moment, bhConstants) {
  var vm = this;

  // expose to the viewe
  vm.search = search;
  vm.clear = clear;


  vm.$onInit = function $onInit() {
    vm.options = [
      { translateKey : 'FORM.LABELS.TODAY', fn : day, range : 'day' },
      { translateKey : 'FORM.LABELS.THIS_WEEK', fn : week, range : 'week' },
      { translateKey : 'FORM.LABELS.THIS_MONTH', fn : month, range : 'month' },
      { translateKey : 'FORM.LABELS.THIS_YEAR', fn : year, range : 'year' },
    ];

    vm.label = vm.label || 'FORM.SELECT.DATE_INTERVAL';

    vm.dateFormat = bhConstants.dayOptions.format;

    vm.pickerOptions = { showWeeks : false };
    startup();
  };

  function search(selection) {
    vm.selected = selection.translateKey;
    selection.fn();
  }

  function day() {
    vm.dateFrom = new Date();
    vm.dateTo = new Date();
  }

  function week() {
    // Fix me if is necessary the first day of week is Sunday or Monday
    vm.dateFrom = moment().startOf('week').toDate();
    vm.dateTo = new Date();
  }

  function month() {
    vm.dateFrom = moment().startOf('month').toDate();
    vm.dateTo = moment().endOf('month').toDate();
  }

  function year() {
    vm.dateFrom = moment().startOf('year').toDate();
    vm.dateTo = moment().endOf('year').toDate();
  }

  function custom() {
    if (vm.dateFrom) {
      vm.dateFrom = new Date(vm.dateFrom);
    }

    if (vm.dateTo) {
      vm.dateTo = new Date(vm.dateTo);
    }
  }

  function clear() {
    delete vm.dateFrom;
    delete vm.dateTo;
  }

  function startup() {
    var option;

    option = ['day', 'week', 'month', 'year'].indexOf(vm.mode);

    // set the default option according the mode
    if (option !== -1) {
      search(vm.options[option]);
      vm.pickerOptions = vm.mode;
    } else {
      custom();
    }

    // set clean mode
    if (vm.mode === 'clean') {
      clear();
    }
  }
}
