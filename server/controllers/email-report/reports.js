/**
 * @module email-report/email-report
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

const BadRequest = require('../../lib/errors/BadRequest');
const NotFound = require('../../lib/errors/NotFound');
const Period = require('../../lib/period'); 

const ReportManager = require('../../lib/ReportManager');
const _ = require('lodash');

const TEMPLATE = './server/controllers/email-report/report.handlebars';

exports.weekly_summary_report=weekly_summary_report;
exports.view1=view1;
 let documentReport;




function weekly_summary_report(req, res, next) {

var period=new Period(new Date());

   
 var week=period.periods.week.limit;

 var monday=week.start();
 var sunday=week.end();
 

 var Lastweek=period.periods.lastWeek.limit;

 var lastmonday=Lastweek.start();
 var lastsunday=Lastweek.end();
  

  //patients registered this week

  var sql=`
          SELECT t1.NumberOfpatientsThisWeek,t2.NumberOfpatientsLastWeek
           FROM 
          (
            SELECT count(uuid) as NumberOfpatientsThisWeek
            FROM patient
            WHERE (registration_date BETWEEN ? AND ? )
          ) as t1,
          (
            SELECT count(uuid) as NumberOfpatientsLastWeek
            FROM patient
            WHERE (registration_date BETWEEN ? AND ? )
          ) as t2
          `;

   var values=[monday,sunday,lastmonday, lastsunday];

  var thisWeekPatients=[];

  db.exec(sql, values)
  .then(rows => {
     res.status(200).json(rows);
  })
  .catch(next)
  .done();



   

   
}

function loadPatientData() {

var period=new Period(new Date());

   
 var week=period.periods.week.limit;

 var monday=week.start();
 var sunday=week.end();
 

 var Lastweek=period.periods.lastWeek.limit;

 var lastmonday=Lastweek.start();
 var lastsunday=Lastweek.end();
  

  //patients registered this week

  var sql=`
          SELECT t1.NumberOfpatientsThisWeek,t2.NumberOfpatientsLastWeek
           FROM 
          (
            SELECT count(uuid) as NumberOfpatientsThisWeek
            FROM patient
            WHERE (registration_date BETWEEN ? AND ? )
          ) as t1,
          (
            SELECT count(uuid) as NumberOfpatientsLastWeek
            FROM patient
            WHERE (registration_date BETWEEN ? AND ? )
          ) as t2
          `;

   var values=[monday,sunday,lastmonday, lastsunday];

  var thisWeekPatients=[];

  return db.exec(sql, values);



   

   
}


function view1(req, res, next) {

const options = {
    renderer : 'pdf',
    saveReport : false,
    filename : 'test_summary_report',
    orientation : 'landscape',
  };
   
 
  loadPatientData().then(rows => {
    
      var _patientsData=rows;
      var  report = new ReportManager(TEMPLATE, req.session,options);

      if(_patientsData.lenght===0){
        _patientsData={"NumberOfpatientsThisWeek":0,"NumberOfpatientsLastWeek":0};
      }else{
         _patientsData= _patientsData[0];
      }

      var data={
        patientsData:_patientsData
      }

        report.render(data)
          .then((result) => { 
            res.set(result.headers).send(result.report);
          })
          .catch(next);

  })
  .catch(next)
  .done();



   




}