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

exports.create = create;
exports.list = list;
exports.list_people=list_people;
exports.delete = remove; 
exports.update=update;


/**
 * @method create
 *
 * @description
 
 * POST /email-report
 */
function create(req, res, next) {
   
  const sql ='INSERT INTO email_report (name, email,frequency,code_report_group) VALUES (?,?,?,?);';
  
  var emailReport=req.body.emailReport;
    var values=[
      emailReport.name,
      emailReport.email,
      emailReport.frequency, 
      emailReport.code_report_group
    ];
 
    db.exec(sql, values)
    .then((row) => {
         res.status(201).json(
           {"id":row.insertId}
           );
    })
    .catch(next)
    .done();
}


/**
 * @method update
 *
 * @description
 
 * POST /email-report/:id
 */
function update(req, res, next) {
   
  const sql ='UPDATE email_report SET name=?, email=?,frequency=?,code_report_group=? WHERE id=?';
  
  var emailReport=req.body.emailReport;
   
    var params=[
      emailReport.name,
      emailReport.email,
      emailReport.frequency, 
      emailReport.code_report_group,
      emailReport.id,
    ];
 
    db.exec(sql, params)
    .then((row) => {
         
         res.status(200).json(
           {"id":emailReport.id}
           );
    })
    .catch(next)
    .done();
     
}


/**
 * @method list
 *
 * @description
 * API /email-report/list-emai-report
 */
function list(req, res, next) {
   
  const sql = `
    SELECT  er.* , rp.name as 'report_group'
    FROM email_report er, report_group rp 
    WHERE er.code_report_group=rp.code;
  `;

  db.exec(sql, {})
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}



/**
 * @method list_people
 *
 * @description
 * API /email-report/list-people
 */
function list_people(req, res, next) {
   
  const  sql=req.body.sql;

  db.exec(sql, {})
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}







 

/**
 * @method delete
 *
 * @description
 * Deletes a single email report from the database and disk specified by
 * the email_report id
 *
 * DELETE /email-report/:id
 */
function remove(req, res, next) {

  const _id = req.params.id; 

  const sql = `
    DELETE FROM email_report WHERE id = ?;
  `;

  db.exec(sql, [_id])
  .then(rows => {
    if (!rows.affectedRows) {
      throw new NotFound(
        `Could not find email report ${_id}.`
      );
    }
 
    res.sendStatus(204);
  })
  .catch(next)
  .done();
}
