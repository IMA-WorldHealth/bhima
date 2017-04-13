angular.module('bhima.services')
.service('PeriodService', PeriodService);

PeriodService.$inject = ['moment'];

/** @TODO rewrite this using AMD synatx so that the same file can be used across
 *        the client and the server */
function PeriodService(Moment) {
  var service = this;

  /** @const */
  var periods = {
    today : {
      key : 'today',
      translateKey : 'PERIODS.TODAY',
      limit : calculatePeriodLimit('date')
    },
    week : {
      key : 'week',
      translateKey : 'PERIODS.THIS_WEEK',
      limit : calculatePeriodLimit('week')
    },
    month : {
      key : 'month',
      translateKey : 'PERIODS.THIS_MONTH',
      limit : calculatePeriodLimit('month')
    },
    year : {
      key : 'year',
      translateKey : 'PERIODS.THIS_YEAR',
      limit : calculatePeriodLimit('year')
    },
    yesterday : {
      key : 'yesterday',
      translateKey : 'PERIODS.YESTERDAY',
      limit : calculatePeriodLimit('date', -1)
    },
    lastWeek : {
      key : 'lastWeek',
      translateKey : 'PERIODS.LAST_WEEK',
      limit : calculatePeriodLimit('week', -1)
    },
    lastMonth : {
      key : 'lastMonth',
      translateKey : 'PERIODS.LAST_MONTH',
      limit : calculatePeriodLimit('month', -1)
    },
    lastYear : {
      key : 'lastYear',
      translateKey : 'PERIODS.LAST_YEAR',
      limit : calculatePeriodLimit('year', -1)
    },

    // components will make an exception for all time - no period has to be selected
    // on the server this simple removes the WHERE condition
    allTime : {
      key : 'allTime',
      translateKey : 'PERIODS.ALL_TIME'
    },

    custom : {
      key : 'custom',
      translateKey : 'PERIODS.CUSTOM'
    }
  };
  var categories = {
    THIS : [periods.today, periods.week, periods.month, periods.year],
    LAST : [periods.yesterday, periods.lastWeek, periods.lastMonth, periods.lastYear],
    OTHER : [periods.allTime]
  };

  service.index = periods;
  service.categories = categories;
  service.definition = definition;

  service.dateFormat = 'DD/MM/YYYY';

  function calculatePeriod(key) {

  }

  function definition(key) {
    var instance = angular.copy(periods[key]);
    var calculate = instance.limit;

    // make an exception for all time which does not have a defined limit
    if (calculate) {
      instance.start = calculate.start();
      instance.end = calculate.end();
    }
    return instance;
  }

  function calculatePeriodLimit(periodKey, modifier) {
    var dateModifier = modifier || 0;
    var currentPeriod = Moment().get(periodKey);

    console.log(periodKey, currentPeriod, dateModifier);

    return {
      start : function () { return Moment().set(periodKey, currentPeriod + dateModifier).startOf(periodKey).format(service.dateFormat); },
      end : function () { return Moment().set(periodKey, currentPeriod + dateModifier).endOf(periodKey).format(service.dateFormat); }
    }
  }

  // using these two methods gaurantees that period and custom period filters are never interchanged

  // returns an array of filters that should be applied given the new period selected
  // responsible for ensuring that custom period start and end are never included with the period filter
  service.processFilterChanges = function processFilterChanges(period, periodKey, customStartKey, customEndKey) {
    var periodChanges = [];

    if (period === periods.custom) {
      // ensure period key is empty
      periodChanges.push({ key : 'period', value : null });

      // populate custom values
      periodChanges.push({ key : 'custom_period_start', value : period.startTime });
      periodChanges.push({ key : 'custom_period_end', value : period.endTime });
    } else {

      // ensure custom period options are removed
      periodChanges.push({ key : 'custom_period_start', value : null });
      periodChanges.push({ key : 'custom_period_end', value : null });

      periodChanges.push({ key : 'period', value : period.key, displayValue : period.translateKey });
    }

    return periodChanges;
  }

  service.defaultFilters = function defaultFilters(periodKey, customStartKey, customEndKey) {
    var defaultPeriod = periods.today;
    return [
      { key : 'period', value : defaultPeriod.key, displayValue : defaultPeriod.translateKey },
      { key : 'custom_period_start', value : null },
      { key : 'custom_period_end', value : null }
    ];
  }

// accepts a target array and an array of values, if any of the values are in the array
}
