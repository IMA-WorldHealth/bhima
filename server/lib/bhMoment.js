/**
 * this class helps to get start date and end date of a period
 */
const moment = require('moment');

class BhMoment {
  constructor(date) {
    this.value = moment(date);
  }

  day() {
    return {
      dateFrom : moment(this.value).startOf('day'),
      dateTo : moment(this.value).endOf('day'),
    };
  }

  week() {
    return {
      dateFrom : moment(this.value).startOf('week'),
      dateTo : moment(this.value).endOf('week'),
    };
  }

  month() {
    return {
      dateFrom : moment(this.value).startOf('month'),
      dateTo : moment(this.value).endOf('month'),
    };
  }

  year() {
    return {
      dateFrom : moment(this.value).startOf('year'),
      dateTo : moment(this.value).endOf('year'),
    };
  }
}

module.exports = BhMoment;
