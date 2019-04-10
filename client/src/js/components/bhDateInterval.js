/**
 * @name bhDateInterval
 * @description
 * The `bhDateInterval` component provide a mean to select dates plage between
 * two dates. The dates values returned are send to dates models given in
 * date-from and date-to attributes.
 *
 * An optional flag `limit-min-fiscal` can be provided that limits the from and
 * to date inputs to not allow dates before the start of the first enterprise
 * fiscal year.
 *
 * @example
 * ```html
 * <bh-date-interval date-from="$MyCtrl.dateFrom" date-to="$MyCtrl.dateTo">
 * </bh-date-interval>
 * ```
 */
angular.module('bhima.components')
  .component('bhDateInterval', {
    templateUrl : '/modules/templates/bhDateInterval.tmpl.html',
    controller : bhDateInterval,
    bindings : {
      dateFrom : '=', // date from
      dateTo : '=', // date to
      dateId : '@?', // date identifier
      required : '<?', // true or false
      onChange : '&?', // on change action
      canClear : '<?', // flag for displaying clear button
      label : '@?',
      mode : '@?', // the date mode (day|month|year)
      limitMinFiscal : '@?', // do not allow the minimum date to be before the first fiscal year
    },
  });

// dependencies injection
bhDateInterval.$inject = ['moment', 'bhConstants', 'FiscalService', 'SessionService'];

// controller definition
function bhDateInterval(moment, bhConstants, Fiscal, Session) {
  const $ctrl = this;

  // expose to the view
  $ctrl.search = search;
  $ctrl.clear = clear;

  $ctrl.$onInit = function $onInit() {
    // specify if clear button can be displayed
    if (!angular.isDefined($ctrl.canClear)) {
      $ctrl.canClear = true;
    }

    $ctrl.options = [
      { translateKey : 'FORM.LABELS.TODAY', fn : day, range : 'day' },
      { translateKey : 'FORM.LABELS.THIS_WEEK', fn : week, range : 'week' },
      { translateKey : 'FORM.LABELS.THIS_MONTH', fn : month, range : 'month' },
      { translateKey : 'FORM.LABELS.THIS_YEAR', fn : year, range : 'year' },
    ];

    $ctrl.label = $ctrl.label || 'FORM.SELECT.DATE_INTERVAL';
    $ctrl.dateFormat = bhConstants.dayOptions.format;
    $ctrl.pickerFromOptions = { showWeeks : false };
    $ctrl.pickerToOptions = { showWeeks : false, minDate : $ctrl.dateFrom };

    // if controller has requested limit-min-fiscal, fetch required information
    if (angular.isDefined($ctrl.limitMinFiscal)) {
      getMinimumFiscalYearDate();
    }

    startup();
  };

  function getMinimumFiscalYearDate() {
    Fiscal.getEnterpriseFiscalStartDate(Session.enterprise.id)
      .then(response => {
        $ctrl.pickerFromOptions.minDate = new Date(response.start_date);
      });
  }

  $ctrl.onChangeDate = () => {
    angular.extend($ctrl.pickerToOptions, { minDate : $ctrl.dateFrom });

    if ($ctrl.onChange) {
      $ctrl.onChange({ dateFrom : $ctrl.dateFrom, dateTo : $ctrl.dateTo });
    }
  };

  function search(selection) {
    $ctrl.selected = selection.translateKey;
    selection.fn();
    $ctrl.onChangeDate();
  }

  function day() {
    $ctrl.dateFrom = new Date();
    $ctrl.dateTo = new Date();
  }

  function week() {
    // Fix me if is necessary the first day of week is Sunday or Monday
    $ctrl.dateFrom = moment().startOf('week').toDate();
    $ctrl.dateTo = new Date();
  }

  function month() {
    $ctrl.dateFrom = moment().startOf('month').toDate();
    $ctrl.dateTo = moment().endOf('month').toDate();
  }

  function year() {
    $ctrl.dateFrom = moment().startOf('year').toDate();
    $ctrl.dateTo = moment().endOf('year').toDate();
  }

  function custom() {
    if ($ctrl.dateFrom) {
      $ctrl.dateFrom = new Date($ctrl.dateFrom);
    }

    if ($ctrl.dateTo) {
      $ctrl.dateTo = new Date($ctrl.dateTo);
    }
  }

  function clear() {
    delete $ctrl.dateFrom;
    delete $ctrl.dateTo;
  }

  function startup() {
    const option = ['day', 'week', 'month', 'year'].indexOf($ctrl.mode);

    // set the default option according the mode
    if (option !== -1) {
      search($ctrl.options[option]);
      angular.extend($ctrl.pickerFromOptions, { mode : $ctrl.mode });
    } else {
      custom();
    }

    // set clean mode
    if ($ctrl.mode === 'clean') {
      clear();
    }
  }
}
