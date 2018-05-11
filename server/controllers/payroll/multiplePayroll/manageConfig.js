function manageConfigurationData(rows, params) {
  const offDays = rows[1];
  const weekEndDays = rows[3];
  const periodFrom = new Date(params.dateFrom);
  const periodTo = new Date(params.dateTo);

  const validOffDays = [];
  const validHolidays = [];

  offDays.forEach(offDay => {
    let invalidOffDays = false;
    const offdayIndice = new Date(offDay.date).getDay();
    weekEndDays.forEach(days => {
      if (offdayIndice === days.indice) {
        invalidOffDays = true;
      }
    });
    if (!invalidOffDays) {
      validOffDays.push(offDay);
    }
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

          const offDayCheck = moment(off.date).format('YYYY-MM-DD');
          const dayCheck = moment(day).format('YYYY-MM-DD');

          if (offDayCheck === dayCheck) {
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

  let range = getDates(periodFrom, periodTo);
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
