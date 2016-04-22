/**
* The /profit_centers HTTP API endpoint
*
* @module finance/profit_centers
*
* @description This controller is responsible for implementing all crud and others custom request
* on the profit_center table through the `/profit_centers` endpoint.
*
* @requires lib/db
**/


var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

/**
* Returns an array of profit centers
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /profit_centers : Get list of profit_centers
* var profitCenters = require('finance/profit_centers');
* profitCenters.list(req, res, next);
*/

function list (req, res, next) {
  'use strict';
  var sql =
    'SELECT p.id, p.text FROM profit_center AS p';

  if (req.query.full === '1') {

    sql =
      `SELECT p.id, p.text, p.project_id, p.note, pr.name, pr.abbr, pr.enterprise_id, pr.zs_id
      FROM profit_center AS p JOIN project AS pr ON p.project_id = pr.id`;
  }

  if(req.query.available === '1') {
    sql += ' WHERE p.id NOT IN (SELECT s.profit_center_id FROM service AS s WHERE NOT ISNULL(s.profit_center_id))';
  }

  sql += ' ORDER BY p.text;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


/**
* Create a profit center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // POST /profit_centers : Insert a profit center
* var profitCenters = require('finance/profit_centers');
* profitCenters.create(req, res, next);
*/

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createProfitCenterQuery = 'INSERT INTO profit_center SET ?';

  delete record.id;

  db.exec(createProfitCenterQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}


/**
* Update a profit center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // PUT /profit_centers : update a profit center
* var profitCenters = require('finance/profit_centers');
* profitCenters.update(req, res, next);
*/

function update(req, res, next) {
  'use strict';

  var queryData = req.body;
  var profitCenterId = req.params.id;
  var updateProfitCenterQuery = 'UPDATE profit_center SET ? WHERE id = ?';

  delete queryData.id;

  lookupProfitCenter(profitCenterId)
    .then(function () {
      return db.exec(updateProfitCenterQuery, [queryData, profitCenterId]);
    })
    .then(function (result) {
      return lookupProfitCenter(profitCenterId);
    })
    .then(function (profitCenter) {
      res.status(200).json(profitCenter);
    })
    .catch(next)
    .done();
}


/**
* Remove a profit center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // DELETE /profit_centers : delete a profit center
* var profitCenters = require('finance/profit_centers');
* profitCenters.remove(req, res, next);
*/

function remove(req, res, next) {
  var profitCenterId = req.params.id;
  var removeProfitCenterQuery = 'DELETE FROM profit_center WHERE id = ?';

  lookupProfitCenter(profitCenterId)
    .then(function () {
      return db.exec(removeProfitCenterQuery, [profitCenterId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

/**
* Return a profit center details from the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /profit_centers : returns a profit center detail
* var proitCenters = require('finance/profit_centers');
* profitCenters.detail(req, res, next);
*/

function detail(req, res, next) {
  'use strict';

  lookupProfitCenter(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
* Return a profit center instance from the database
*
* @param {integer} id of a profit center
*
*/

function lookupProfitCenter (id) {
  'use strict';

  var sql =
    'SELECT p.id, p.text, p.note, p.project_id FROM profit_center AS p WHERE p.id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a profit center with id ${id}`);
      }
      return rows[0];
    });
}

/**
* Return a profit value by scanning the genral ledger
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /profit_centers/:id/profit : returns a profit detail
* var profitCenters = require('finance/profit_centers');
* profitCenters.detail(req, res, next);
*/

function getProfitValue (req, res, next){

  var sql = null, optionalCondition = '';

  lookupProfitCenter(req.params.id)
    .then(function (){      
      sql = 
        'SELECT ac.id FROM account AS ac WHERE ac.pc_id = ? AND ac.is_title = 0';

      return db.exec(sql, req.params.id);
    })
    .then(function (rows){
      if (rows.length > 0) {
        rows = rows.map(function (row) { return row.id;});
        optionalCondition = ' OR gl.account_id IN (' + rows.join(',') + ')';
      }

      sql =
        `SELECT IFNULL(SUM(t.credit_equiv - t.debit_equiv), 0) as profit
        FROM (SELECT gl.debit_equiv, gl.credit_equiv FROM general_ledger AS gl LEFT JOIN 
        profit_center AS pc ON gl.pc_id = pc.id WHERE gl.pc_id = ? ${optionalCondition}) 
        AS t`;

      return db.exec(sql, req.params.id);
    })
    .then(function (result){
      res.status(200).json(result[0]);
    })
    .catch(next)
    .done();
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.getProfitValue = getProfitValue;