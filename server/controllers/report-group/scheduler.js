var schedule = require('node-schedule');
const Period = require('../../lib/period');

exports.setScheduler = setScheduler;
const mail = require('./mail');

/*
this function configurate the sending of the report by email event
it specify the the Hour and minute that the event should be handled
*/

function setScheduler() {


  var rule = new schedule.RecurrenceRule();
  rule.hour = 10;
  rule.minute = 57;
  let j = schedule.scheduleJob(rule, function () {

  // console.log('Bhima should send reports by email now');

    const period = new Period(new Date());
    const week = period.periods.week.limit;
    const today = period.periods.today.limit;
    const month = period.periods.month.limit;

  // send all dayly reports
    launch('Dayly');

  // send all weekly reports
    if ((week.start === today.start) && (week.end === today.end)) {
      launch('Weekly');
    }

    // send all monthly reports
    if (month.end === today.start){
      launch('Monthly');
    }

  });
}

// using mailgun api to send report
function launch(frequency) {

  mail.sendScheduledReport(frequency).then((result) => {
    console.log('completed sending ' + frequency + '  scheduled report');
  })
  .catch((error) => {
    console.log('error while sending ' + frequency + ' report', error);
  });

}

