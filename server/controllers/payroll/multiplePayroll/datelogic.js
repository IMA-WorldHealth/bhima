/**
 * @function isDateOnWeekend
 *
 * @description
 * Returns true if the date passed in falls on the weekend configuration.
 */
function isDateOnWeekend(date, weekendDayIndex) {
  return weekendDayIndex.includes(new Date(date).getDay());
}

/**
 * @function createDateRange
 *
 * @description
 * Creates an array of dates, with each element being a date within
 * the start/end date period.  The start date is the first element
 * of the array.
 */
function createDateRange(startDate, endDate) {
  const dates = [];

  let currentDate = startDate;

  const addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }

  return dates;
}

module.exports = {
  isDateOnWeekend,
  createDateRange,
};
