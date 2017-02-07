angular.module('bhima.services')
  .service('DateService', DateService);

DateService.$inject = [ 'moment' ];

/**
 * @class DateService
 *
 * @description
 * Provides logical namespacing for common date manipulations,
 * such as getting the current day, week, month, year.  Includes
 * tooling to for previous weeks and dates.
 *
 * NOTE - by design, these all return the values at midnight of the
 * start of the selected date element.  For example, DateService.next.month()
 * will return the midnight on the first day of the coming month.  If you
 * wanted to construct a date range for the month you were in, it would
 * look like this:
 *
 * @example
 * var range = {
 *   start : DateService.current.month(), // The 1st of this month
 *   end : DateService.next.month()       // The 1st of next month
 * };
 *
 *
 * Similarly, if you wanted to get the previous week:
 *
 * @example
 * var range = {
 *   start : DateService.previous.week(), // Sunday of past week (> 7 days ago)
 *   end : DateService.current.week()     // Sunday of this week
 * };
 *
 *
 * However, if you want to specify the two months ago through the end
 * of the current month, it might look like this:
 *
 * @example
 * var range = {
 *   start : DateService.previous.nMonth(2),  // start two months before this month
 *   end : DateService.next.month()           // run through the end of this month
 * };                                         // total months = 3 month span!
 *
 *
 * *NEW*
 *  Provides a generic date-to-string function that returns a same date string
 */
function DateService(moment) {
  var service = this;

  // set up namespaces for date operations
  service.previous = {};
  service.current = {};
  service.next = {};
  service.util = {};
  service.period = {};

  /*
  * Very generic function to subtract days, months, years
  * from a provided date.
  */
  function subtract(date, type, n) {
    switch (type) {

      case 'day':
        date.setDate(date.getDate() - n);
        break;

      case 'week':
        date.setDate(date.getDate() - 7*n);
        break;

      case 'month':
        date.setMonth(date.getMonth() - n);
        break;

      case 'year':
        date.setYear(date.getFullYear() - n);
        break;

      default:
        throw new Error('Unrecognized date type!');
    }

    return date;
  }

  /*
   * It return main period of times and duration
   */
  service.period = function () {
    return {
      today : {
        cacheKey : 'today',
        translateKey : 'FORM.BUTTONS.TODAY'
      },
      week : {
        cacheKey : 'week',
        translateKey : 'FORM.BUTTONS.THIS_WEEK'
      },
      month : {
        cacheKey : 'month',
        translateKey : 'FORM.BUTTONS.THIS_MONTH'
      },
      year : {
        cacheKey : 'year',
        translateKey : 'FORM.BUTTONS.THIS_YEAR'
      }
    };
  };

  /* ------------------------------------------------------------------------ */

  /*
  *  Calculations for the current date, week, month, year.
  *
  *  NOTE - All other (previous, next) dates depend on these
  *  core functions.  They should be well tested.
  */

  // returns midnight, today.
  service.current.day = function () {
    var date = new Date();
    date.setHours(0,0,0,0);
    return date;
  };

  // returns midnight, the sunday of the current week
  service.current.week = function () {
    var date = service.current.day();
    date.setDate(date.getDate() - date.getDay());
    return date;
  };

  // returns midnight, the 1st of the current month
  service.current.month = function () {
    var date = service.current.day();
    date.setDate(1);
    return date;
  };

  // returns midnight, Jan 1st, of the current year
  service.current.year = function () {
    var date = service.current.day();
    date.setMonth(0);
    date.setDate(1);
    return date;
  };

  /* ------------------------------------------------------------------------ */

  /*
  *  Calculations for the previous date, week, month, year.
  */

  // alias for service.previous.nDay(1)
  service.previous.day = function () {
    return service.previous.nDay(1);
  };

  // returns the day n days ago
  service.previous.nDay = function (n) {
    return subtract(service.current.day(), 'day', n);
  };

  // alias for service.previous.nWeek(1)
  service.previous.week = function () {
    return service.previous.nWeek(1);
  };

  // returns the week n weeks ago
  service.previous.nWeek = function (n) {
    return subtract(service.current.week(), 'week', n);
  };

  // alias for service.previous.nMonth(1)
  service.previous.month = function () {
    return service.previous.nMonth(1);
  };

  // returns the month n months ago
  service.previous.nMonth = function (n) {
    return subtract(service.current.month(), 'month', n);
  };

  // alias for service.previous.nYear(1)
  service.previous.year = function () {
    return service.previous.nYear(1);
  };

  // returns the year n years ago
  service.previous.nYear = function (n) {
    return subtract(service.current.year(), 'year', n);
  };


  /* ------------------------------------------------------------------------ */

  /*
  *  Calculations for the next date, week, month, year.
  *
  *  NOTE - We can leverage subtract from above, and simply change the
  *  direction of our search.  Instead of n periods ago, we look for -n periods
  *  ago.
  */

  // alias for service.next.nDay(1)
  service.next.day = function () {
    return service.next.nDay(1);
  };

  // returns the day n days ago
  service.next.nDay = function (n) {
    return subtract(service.current.day(), 'day', -1*n);
  };

  // alias for service.next.nWeek(1)
  service.next.week = function () {
    return service.next.nWeek(1);
  };

  // returns the week n weeks ago
  service.next.nWeek = function (n) {
    return subtract(service.current.week(), 'week', -1*n);
  };

  // alias for service.next.nMonth(1)
  service.next.month = function () {
    return service.next.nMonth(1);
  };

  // returns the month n months ago
  service.next.nMonth = function (n) {
    return subtract(service.current.month(), 'month', -1*n);
  };

  // alias for service.next.nYear(1)
  service.next.year = function () {
    return service.next.nYear(1);
  };

  // returns the year n years ago
  service.next.nYear = function (n) {
    return subtract(service.current.year(), 'year', -1*n);
  };


  /* ------------------------------------------------------------------------ */

  // yet another javascript date string function
  // expects a date object
  // return 'YYYY-MM-DD' format
  service.util.str = function (date, format) {
    return moment(date).format(format || 'YYYY-MM-DD');
  };
}
