/**
* Holiday Controller
*
* This controller exposes an API to the client for reading and writing Holiday
*/

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');

// GET /Holiday
function lookupHoliday(id) {
  var sql =`
    SELECT h.id, h.label, BUID(h.employee_uuid) AS employee_uuid, h.dateFrom, h.dateTo, h.percentage
    FROM holiday AS h  
    WHERE h.id = ?`;

  return db.one(sql, [id]);
}

// Check Holidays
/** 
*
* This function prevents to define for an employee, two periods of holidays that fits nested
*/
function checkHoliday(param) {
  var sql = `
    SELECT id, BUID(employee_uuid) AS employee_uuid, label, dateTo, percentage, dateFrom 
    FROM holiday WHERE employee_uuid = ?
    AND ((dateFrom >= DATE(?)) OR (dateTo >= DATE(?)) OR (dateFrom >= DATE(?))
    OR (dateTo >= DATE(?)))
    AND ((dateFrom <= DATE(?)) OR (dateTo <= DATE(?)) OR (dateFrom <= DATE(?))
    OR (dateTo <= DATE(?)))
  `;

  return db.exec(sql, [db.bid(param.employee_uuid), param.dateFrom, param.dateFrom, param.dateTo, param.dateTo, param.dateFrom, param.dateFrom, param.dateTo, param.dateTo]);
}


// Lists the Payroll Holidays
function list(req, res, next) {
  const sql = `
    SELECT h.id, h.label, BUID(h.employee_uuid) AS employee_uuid, h.dateFrom, h.dateTo, p.display_name, h.percentage
    FROM holiday AS h
    JOIN employee AS e ON e.uuid = h.employee_uuid
    JOIN patient AS p ON p.uuid = e.patient_uuid
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /Holiday/:ID
*
* Returns the detail of a single Holiday
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupHoliday(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /Holiday
function create(req, res, next) {
  const sql = `INSERT INTO holiday SET ?`;
  const data = req.body;
  data.employee_uuid = db.bid(data.employee_uuid);

  checkHoliday(data)
    .then((record) => {
      if (record.length) {
        throw new BadRequest('Holiday Nested.', 'ERRORS.HOLIDAY_NESTED');
      }
      
      return db.exec(sql, [data]);
    })
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /Holiday /:id
function update(req, res, next) {
  const sql = `UPDATE holiday SET ? WHERE id = ?;`;
  const data = req.body;
  console.log('AA');
  if (data.employee_uuid) {
    data.employee_uuid = db.bid(data.employee_uuid);  
  }

  console.log('BBBBBBBB');
  
  checkHoliday(data)
    .then((record) => {
      console.log('RECOREDDDDDDDddd');


      if (record.length > 1) {
        throw new BadRequest('Holiday Nested.', 'ERRORS.HOLIDAY_NESTED');
      }
      
      return db.exec(sql, [data, req.params.id]);
    })  
    .then(() => {
      return lookupHoliday(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /Holiday/:id
function del(req, res, next) {
  const sql = `DELETE FROM holiday WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Holiday with id ${req.params.id}`);
      }

      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

// get list of Holiday
exports.list = list;

// get details of a Holiday
exports.detail = detail;

// create a new Holiday
exports.create = create;

// update Holiday informations
exports.update = update;

// Delete a Holiday
exports.delete = del;