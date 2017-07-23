/**
 * @module mail
 *
 * @description
 * small description of this module
 *
 * @requires db
 * @requires node-uuid
 * @requires BadRequest
 * @requires NotFound
 */


const uuid = require('node-uuid'); 
const db = require('../../lib/db'); 
const Topic = require('../../lib/topic'); 
const moment = require('moment'); 
const BadRequest = require('../../lib/errors/BadRequest'); 
const NotFound = require('../../lib/errors/NotFound'); 
const Period = require('../../lib/period'); 

//my report function are definied in the below file
const reports_def = require('../email-report/weeklySummaryReport'); 
const email_report = require('../email-report/index'); 

exports.sendReport = sendReport; 
exports.sendScheduledReport = sendScheduledReport; 


/**
 * @method sendReport
 *
 * @description
 This method is used to send report by email
 If you want to add a report to be sent by mail you have to add it infomation in reportMap constante
 This map has two parameter:
    function => the function that should  rendered the report
    fileName=> the report file name
  Each reportMap index is the report_group code in the database
 */

//frequency = "Dayly" or "Weekly" or  "Monthly";

function sendReport(req, res, next, frequency = 'Weekly') {

  const sql = 'SELECT  * FROM report_group'; 

  //linking report groups data in the database to pdf report generable from bhima
  const reportMap =  {
    '001': {
      function:reports_def.weeklySummaryReport, 
      fileName:'weeklySummaryReport.pdf'
    }, 
   /* '002': {
      function:reports_def.anotherReport, 
      fileName:'anotherReport.pdf'
    }, */
  }; 

  // getting all report_group
  db.exec(sql,  {}).then(rows =>  {

    //forEach report_group we should get profiles(name + email) and then email them
    rows.forEach((item) =>  {

      //getting profiles
      email_report.getProfile(item.code, frequency).then((profiles) =>  {

      //profiles found
      if (profiles.length > 0) {

         //rendering the report
        reportMap[item.code].function(req, res, next)
        .then((report_result) =>  {
        //every infomations are collectted for sending email
        //let use the mailgun api


          mailgun(profiles, report_result.report, reportMap[item.code].fileName); 
        }); 
      }
      })

    }); 

    res.status(200).json( {'result':'ok'}); 
  })
  .catch(next)
  .done(); 
}




function sendScheduledReport(frequency) {

  const sql = 'SELECT  * FROM report_group'; 

//linking report groups data in the database to pdf report generable from bhima
  const reportMap =  {
    '001': {
      fct:reports_def.weeklySummaryReport, 
      fileName:'weeklySummaryReport.pdf'
    }
  }; 

// getting all report_group
  return db.exec(sql,  {}).then((rows) =>  {
 
  //forEach report_group we should get profiles(name + email) and then email them
  const groupsPromiseExecution = rows.map((reportGroup) =>  {

  //getting profiles
    return email_report.getProfile(reportGroup.code, frequency).then((profiles) =>  {

    //profiles found
      if (profiles.length > 0) {

        //console.log('profiles nomber :' + profiles.length); 

      //rendering the report
        var session =  {}; 
        return reportMap[reportGroup.code].fct(session).then((report_result) =>  {
      //every infomations are collectted for sending email
      //let use the mailgun api 

          
          mailgun(profiles, report_result.report, reportMap[reportGroup.code].fileName); 
        }); 
      }
    })
  }); 

  return Promise.all(groupsPromiseExecution); 
  }); 
}
//sending email using mailgun API


/*
  @profile parameter is an array such as  this one below
  [{name:test1, email:test1@gmail.com}, {name:test2, email:test2@gmail.com}]

  @file parameter is the pdf content

  @fileName parameter if the name of the file that the user will download

*/
function mailgun(profiles, file, fileName) {

  var api_key = process.env.MAILGUN_API_KEY; 
  var domain = process.env.MAILGUN_DOMAIN; 
  var sender=process.env.MAILGUN_SENDER;
  var default_recevoir=process.env.MAILGUN_DEFAULT_RECEVIOR;

  var mailgun = require('mailgun-js')( {apiKey:api_key, domain:domain }); 

  var bcc_emails = ''; 
  //formatting bcc emails
  profiles.forEach((profile) =>  {
    bcc_emails += profile.name + '<' + profile.email + '>, '; 
  }); 

  //formation the attached file name, it should include the date
  var dat = moment().format('YYYY MM DD HH[h]'); 

  var attch = new mailgun.Attachment( {data:file, filename:dat + ' ' + fileName }); 
  // structuring all infomations about an email  when using mailgun API
  var data =  {
    from:sender, 
    to:default_recevoir, 
    bcc:bcc_emails, 
    subject:'BHIMA reports / Rapport de BHIMA', 
    text:'The report is attached (Vous trouverez en attache le rapport qui vous a été envoyé)', 
    attachment:attch
  }; 

  mailgun.messages().send(data, function (error, body) {
    console.log(body); 
    console.log(error); 
  }); 

}
