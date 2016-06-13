var db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');


function lookupFiscalYear(id) {
  'use strict';

  var sql =
    `SELECT id, enterprise_id, number_of_months, label, start_date, 
     previous_fiscal_year_id, locked, note
     FROM fiscal_year 
     WHERE id = ? `;

  return db.exec(sql, id)
    .then(function (rows) {
      // Record Not Found !
      if (rows.length === 0) {
        throw new NotFound(`Record Not Found with id: ${id}`);
      }

      return rows[0];
    });
}

// GET /fiscal
function list (req, res, next) {
  'use strict';
  let sql;
  let params = [];

  // make a complex query
  if (req.query.detailed === '1') {
    params = params.concat(req.session.enterprise.id);

    sql =
      `SELECT f.id, f.enterprise_id, f.number_of_months, f.label, f.start_date, 
       f.previous_fiscal_year_id, f.locked, f.created_at, f.updated_at, f.note, DATE_ADD(start_date, INTERVAL number_of_months MONTH) AS end_date, 
       f.user_id, u.first, u.last
       FROM fiscal_year AS f
       JOIN user AS u ON u.id = f.user_id
       WHERE f.enterprise_id = ? `;

    if(req.query.by && req.query.order){
      params = params.concat(req.query.by, req.query.order);
      sql += ` ORDER BY ? ?;`;
    }
  // execute the query  
  } else {
    sql =
      'SELECT id, label FROM fiscal_year';
  }

  // execute the query
  db.exec(sql, params)
  .then(rows => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

// GET / Current Fiscal
function getFiscalYearsByDate(req, res, next){
  'use strict';
  var sql,
    date = req.query.date;
    
  sql =
    `SELECT p.fiscal_year_id, f.previous_fiscal_year_id  
     FROM period AS p
     JOIN fiscal_year AS f ON f.id = p.fiscal_year_id
     WHERE p.start_date <= DATE(?) AND DATE(?) <= p.end_date`;

  db.exec(sql, [date, date])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

// POST /fiscal
// creates a new fiscal year
function create(req, res, next) {
  var record = req.body;
  record.user_id = req.session.user.id;
  record.enterprise_id = req.session.enterprise.id;
  record.start_date = new Date(record.start_date);

  var sql = 'INSERT INTO fiscal_year SET ?';

  db.exec(sql, [record])
  .then(function (result) {
    res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

/**
* GET /fiscal/:id
*
* Returns the detail of a single Fiscal Year
*/
function detail(req, res, next) {
  'use strict';

  var id = req.params.id;

  lookupFiscalYear(id)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

/**
 * Updates a fiscal year details (particularly id)
 */
function update(req, res, next) {
  'use strict';

  var queryData = req.body;
  if(queryData.start_date){
    queryData.start_date = new Date(queryData.start_date);
  }

  var fiscalYearId = req.params.id;

  var sql = 'UPDATE fiscal_year SET ? WHERE id = ?';

  delete queryData.id;

  lookupFiscalYear(fiscalYearId)
  .then(function () {
    return db.exec(sql, [queryData, fiscalYearId]);
  })
  .then(function () {
    return lookupFiscalYear(fiscalYearId);
  })
  .then(function (fiscalYear) {
    res.status(200).json(fiscalYear);
  })
  .catch(next)
  .done();
}

/**
 * Remove a fiscal year details (particularly id)
 */

function remove(req, res, next) {

  var fiscalYearId = req.params.id;
  var sql = 'DELETE FROM fiscal_year WHERE id = ?';

  lookupFiscalYear(fiscalYearId)
    .then(function () {
      return db.exec(sql, [fiscalYearId]);
    })
    .then(function () {
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}


exports.list = list;
exports.getFiscalYearsByDate = getFiscalYearsByDate;
exports.create = create;
exports.detail = detail;
exports.update = update;
exports.remove = remove;