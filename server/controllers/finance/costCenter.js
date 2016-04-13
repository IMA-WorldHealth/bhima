/**
* The /cost_centers HTTP API endpoint
*
* @module finance/costCenters
*
* @description This controller is responsible for implementing all crud and others custom request
* on the cost_center table through the `/cost_centers` endpoint.
*
* @requires lib/db
**/


var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

/**
* Returns an array of cost centers
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /cost_centers : Get list of cost_centers
* var costCenters = require('finance/cost_centers');
* costCenters.list(req, res, next);
*/

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT c.id, c.text FROM cost_center AS c';

  if (req.query.full === '1') {
    sql =
      'SELECT c.id, c.text, c.project_id, c.note, c.is_principal, p.name, p.abbr, p.enterprise_id, p.zs_id ' +
      'FROM cost_center AS c JOIN project AS p ON c.project_id = p.id';
  }

  if(req.query.available === '1') {
    sql += ' WHERE c.id NOT IN (SELECT s.cost_center_id FROM service AS s WHERE NOT ISNULL(s.cost_center_id))';
  }

  sql += ' ORDER BY c.text;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* Create a cost center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // POST /cost_centers : Insert a cost center
* var costCenters = require('finance/cost_centers');
* costCenters.create(req, res, next);
*/

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createCostCenterQuery = 'INSERT INTO cost_center SET ?';

  delete record.id;

  db.exec(createCostCenterQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

/**
* Update a cost center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // PUT /cost_centers : update a cost center
* var costCenters = require('finance/cost_centers');
* costCenters.update(req, res, next);
*/

function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var costCenterId = req.params.id;
  var updateCostCenterQuery = 'UPDATE cost_center SET ? WHERE id = ?';

  delete queryData.id;

  lookupCostCenter(costCenterId, req.codes)
    .then(function () {
      return db.exec(updateCostCenterQuery, [queryData, costCenterId]);
    })
    .then(function (result) {
      return lookupCostCenter(costCenterId, req.codes);
    })
    .then(function (costCenter) {
      res.status(200).json(costCenter);
    })
    .catch(next)
    .done();
}


/**
* Remove a cost center in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // DELETE /cost_centers : delete a cost center
* var costCenters = require('finance/cost_centers');
* costCenters.remove(req, res, next);
*/

function remove (req, res, next) {
  var costCenterId = req.params.id;
  var removeCostCenterQuery = 'DELETE FROM cost_center WHERE id = ?';

  lookupCostCenter(costCenterId, req.codes)
    .then(function () {
      return db.exec(removeCostCenterQuery, [costCenterId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

/**
* Return a cost center details from the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /cost_centers : returns a cost center detail
* varcostCenters = require('finance/cost_centers');
* costCenters.detail(req, res, next);
*/

function detail(req, res, next) {
  'use strict';

  lookupCostCenter(req.params.id, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
* Return a cost center instance from the database
*
* @param {integer} id of acost center
* @param {object} codes object which contain errors code
*
*/

function lookupCostCenter(id, codes) {
  'use strict';

  var sql =
    'SELECT cc.id, cc.text, cc.note, cc.is_principal, cc.project_id FROM cost_center AS cc WHERE cc.id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a cost center with id ${id}`);
      }
      return rows[0];
    });
}

/**
* Return a cost value by scanning the general ledger
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // GET /cost_centers/:id/profit : returns a profit detail
* var costCenters = require('finance/cost_centers');
* costCenters.detail(req, res, next);
*/

function getCostValue (req, res, next){
  var sql = null, optionalCondition = '';


  lookupCostCenter(req.params.id, req.codes)
    .then(function (){   
      sql = 
        'SELECT ac.id FROM account AS ac WHERE ac.cc_id = ? AND ac.is_title=0';

      return db.exec(sql, req.params.id);
    })
    .then(function (rows){
      
      if (rows.length > 0) {
        rows = rows.map(function (row) { return row.id;});
        optionalCondition = ' OR gl.account_id IN (' + rows.join(',') + ')';
      }

      sql =
        'SELECT IFNULL(SUM(t.debit_equiv - t.credit_equiv), 0) AS cost ' +
        'FROM (SELECT gl.debit_equiv, gl.credit_equiv FROM general_ledger AS gl LEFT JOIN ' +
        'cost_center AS cc ON gl.cc_id = cc.id WHERE gl.cc_id=?' + optionalCondition + ') ' +
        'AS t';

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
exports.getCostValue = getCostValue;
