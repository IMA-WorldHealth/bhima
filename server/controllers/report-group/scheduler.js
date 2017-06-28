
var schedule = require('node-schedule');
var request = require("request");

exports.setScheduler = setScheduler;
const mail = require('./mail');

/*
this function configurate the sending report by email event
it specify the the Hour and minute thant the event should be handled
*/
function setScheduler() {

var frequency = 'Weekly';
        mail.sendScheduledReport(frequency)
            .then((result) => {
                console.log('completed snding scheduled report');
            })
            .catch((error) => {
                console.log('error seing report', error);
            });
        
        
    var rule = new schedule.RecurrenceRule();
    rule.hour = 11;
    rule.minute = 35;

    var j = schedule.scheduleJob(rule, function() {

        console.log('Bhima should send reports by email now');

        var frequency = 'Weekly';
        mail.sendScheduledReport(frequency)
            .then((result) => {
                console.log('completed snding scheduled report');
            })
            .catch((error) => {
                console.log('error seing report', error);
            });
        
    });
}