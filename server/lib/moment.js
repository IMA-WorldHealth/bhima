/**
 * this class helps to get start date and end date of a period
 */
const moment = require('moment');

class Moment {
  constructor(date) {
    this.moment = moment(date);
  }

  day() {
    return {
      dateFrom : this.moment.startOf('day'),
      dateTo : this.moment.endOf('day'),
    };
  }

  week() {
    return {
      dateFrom : this.moment.startOf('week'),
      dateTo : this.moment.endOf('week'),
    };
  }

  month() {
    return {
      dateFrom : this.moment.startOf('month'),
      dateTo : this.moment.endOf('month'),
    };
  }

  year() {
    return {
      dateFrom : this.moment.startOf('year'),
      dateTo : this.moment.endOf('year'),
    };
  }
}

module.exports = Moment;
