/**
 *
 * @description
 * This function is used to manage different data for the payment configuration, 
 * filter holidays that are not in the configuration of weekends, deconsidere holidays days which are holidays 
 * but also in the configuration of weeks ends and calculates the number of working days in a pay period
 *
 *
 */

function manageConfigurationData(rows, params) {
  const offDays = rows[1];
  const weekEndDays = rows[3];
  const periodFrom = new Date(params.dateFrom);
  const periodTo = new Date(params.dateTo);
  const moment = require('moment');

  const validHolidays = [];

  const validOffDays = offDays.filter(offDay => {
    const offdayIndice = new Date(offDay.date).getDay();
    const isValidOffDay = weekEndDays.every(weekEndDay => offdayIndice !== weekEndDay.indice);
    return isValidOffDay;
  });

  if (validOffDays.length) {
    rows.push(validOffDays);
  } else {
    rows.push([]);
  }

  const holidays = rows[2];

  holidays.forEach(holiday => {
    const from = new Date(holiday.dateFrom);
    const to = new Date(holiday.dateTo);
    let numberOfDays = 0;

    for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
      if (day >= periodFrom && day <= periodTo) {
        let invalidHoliday = false;
        const holidayIndice = new Date(day).getDay();

        weekEndDays.forEach(days => {
          if (holidayIndice === days.indice) {
            invalidHoliday = true;
          }
        });

        // Check if in a holiday period there is a offDay
        validOffDays.forEach(off => {

          if (moment(off.date).isSame(day, 'day')) {
            invalidHoliday = true;
          }
        });

        if (!invalidHoliday) {
          numberOfDays++;
          validHolidays.push(holiday);
        }
      }
      holiday.numberOfDays = numberOfDays;
    }
  });

  if (validHolidays.length) {
    rows.push(validHolidays);
  } else {
    rows.push([]);
  }

  // Get Working Days
  let workingDay = 0;

  // Returns an array of dates between the two dates
  const getDates = function (startDate, endDate) {
    let dates = [],
      currentDate = startDate,
      addDays = function (days) {
        const date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  };


  const range = getDates(periodFrom, periodTo);
  range.forEach((day) => {

    let invalidDate = false;
    const dayIndice = new Date(day).getDay();

    weekEndDays.forEach(days => {

      if (dayIndice === days.indice) {
        invalidDate = true;
      }
    });

    if (!invalidDate) {
      workingDay++;
    }
  });

  rows.push([{ working_day : workingDay }]);

  return rows;
}

exports.manageConfigurationData = manageConfigurationData;
