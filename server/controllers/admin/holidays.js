/**
* Holiday Controller
*
* This controller exposes an API to the client for reading and writing Holiday
*/

var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

// GET /Holiday
function lookupHoliday(id) {
  var sql =`
    SELECT h.id, h.label, h.employee_id, h.dateFrom, h.dateTo, h.percentage
    FROM holiday AS h  
    WHERE h.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Holidays
function list(req, res, next) {
  const sql = `
    SELECT h.id, h.label, h.employee_id, h.dateFrom, h.dateTo, p.display_name, h.percentage
    FROM holiday AS h
    JOIN employee AS e ON e.id = h.employee_id
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

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /Holiday /:id
function update(req, res, next) {
  const sql = `UPDATE holiday SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
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

      res.status(204).json();
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