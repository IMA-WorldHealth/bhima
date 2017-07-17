var schedule = require('node-schedule');
var request = require("request");

exports.setScheduler = setScheduler;
const mail = require('./mail');

/*
this function configurate the sending of the report by email event
it specify the the Hour and minute that the event should be handled
*/

/*exemple
var frequency = 'Weekly';
mail.sendScheduledReport(frequency).then((result) => {
  console.log('completed sending scheduled report');
})
.catch((error) => {
  console.log('error sending report', error);
});
*/

function setScheduler() {
 
  var rule = new schedule.RecurrenceRule();
  rule.hour = 17;
  rule.minute = 0;
  var j = schedule.scheduleJob(rule, function() {

    //console.log('Bhima should send reports by email now');
    var frequency = 'Weekly';

    mail.sendScheduledReport(frequency).then((result) => {
      console.log('completed sending scheduled report');
    })
    .catch((error) => {
      console.log('error sending report', error);
    });
        
    });
}