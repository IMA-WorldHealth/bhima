/**
* The /fee_centers HTTP API endpoint
*
* @module finance/feeCenters
*
* @description This controller is responsible for implementing all crud and others custom request
* on the fee_center table through the `/fee_centers` endpoint.
*
* @requires lib/db
**/


const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const FilterParser = require('../../lib/filter');

/**
* Returns an array of fee centers
*
* @example
* // GET /fee_centers : Get list of fee_centers
* var feeCenters = require('finance/feeCenter');
* feeCenters.list(req, res, next);
*/
function list (req, res, next) {

  const ordering = 'ORDER BY fc.label';
  const is_detailed = Boolean(Number(req.query.detailed));
  const detailed = is_detailed ? ', fc.note, fc.is_principal, fc.project_id, fc.is_cost, p.name, p.abbr, p.enterprise_id, p.zs_id ' : '';

  const sql =
    `SELECT fc.id, fc.label, fc.is_cost ${detailed} FROM fee_center AS fc JOIN project as p on fc.project_id = p.id`;

  const notInStatement = `(fc.id NOT IN (SELECT DISTINCT s.cc_id FROM service AS s WHERE NOT ISNULL(s.cc_id) UNION SELECT DISTINCT s.pc_id FROM service AS s WHERE NOT ISNULL(s.pc_id)) AND ?)`;

  let filterParser = new FilterParser(req.query, { tableAlias : 'fc' });

  filterParser.equals('is_principal');
  filterParser.equals('is_cost');
  filterParser.custom('available', notInStatement, req.query.available);
  filterParser.setOrder(ordering);

  const query = filterParser.applyQuery(sql);
  const params = filterParser.parameters();

  db.exec(query, params)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* Create a fee center in the database
*
* @example
* // POST /fee_centers : Insert a fee center
* var feeCenters = require('finance/feeCenter');
* feeCenters.create(req, res, next);
*/
function create (req, res, next) {

  let record = req.body;
  const createFeeCenterQuery = 'INSERT INTO fee_center SET ?';

  delete record.id;

  db.exec(createFeeCenterQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

/**
* Update a fee center in the database
*
* @example
* // PUT /fee_centers : update a fee center
* var feeCenters = require('finance/feeCenter');
* feeCenters.update(req, res, next);
*/
function update (req, res, next) {

  let queryData = req.body;
  const feeCenterId = req.params.id;
  const updateFeeCenterQuery = 'UPDATE fee_center SET ? WHERE id = ?';

  delete queryData.id;


   db.exec(updateFeeCenterQuery, [queryData, feeCenterId])
    .then(function (res) {

      if(res.affectedRows === 0){
        throw new NotFound(`Could not update a fee center with id ${feeCenterId}`);
      }

      return lookupFeeCenter(feeCenterId);
    })
    .then(function (feeCenter) {
      res.status(200).json(feeCenter);
    })
    .catch(next)
    .done();
}


/**
* Remove a fee center in the database
*
* @example
* // DELETE /fee_centers : delete a fee center
* var feeCenters = require('finance/feeCenter');
* feeCenters.remove(req, res, next);
*/
function remove (req, res, next) {

  const feeCenterId = req.params.id;
  const removeFeeCenterQuery = 'DELETE FROM fee_center WHERE id = ?';

  return db.exec(removeFeeCenterQuery, [feeCenterId])
    .then(function (res) {
      if(res.affectedRows === 0){
        throw new NotFound(`Could not remove a fee center with id ${feeCenterId}`);
      }
      res.sendStatus(204);
    })
    .catch(next)
    .done();
}

/**
* Return a fee center details from the database
* @example
* // GET /fee_centers : returns a fee center detail
* var feeCenters = require('finance/feeCenters');
* feeCenters.detail(req, res, next);
*/
function detail(req, res, next) {

  lookupFeeCenter(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
* Return a fee center instance from the database
*
* @param {integer} id of a fee center
*
*/
function lookupFeeCenter(id) {

  const sql =
    'SELECT fc.id, fc.label, fc.is_cost, fc.note, fc.is_principal, fc.project_id FROM fee_center AS fc WHERE fc.id = ?';

  return db.one(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a fee center with id ${id}`);
      }
      return rows;
    });
}

/**
* Return a fee cost value by scanning the general ledger
*
*
* @example
* // GET /fee_centers/:id/value : returns a value of the fee center
* var feeCenters = require('finance/feeCenter');
* feeCenters.getFeeValue(req, res, next);
*/
function getFeeValue (req, res, next){

  lookupFeeCenter(req.params.id)
    .then(function (){

      //The value will be multiplied by -1 if the fee center has not is_cost property checked
      const sql =
        `
        SELECT
          IFNULL(IF(t.is_cost = 1, value, value * -1), 0) AS value, t.id
        FROM
          (
            SELECT
              SUM(gl.debit_equiv - gl.credit_equiv) AS value, f.is_cost, f.id
            FROM
              general_ledger AS gl
            JOIN
              fee_center AS f ON gl.fc_id = f.id
            WHERE gl.fc_id = ?
            GROUP BY gl.fc_id
          ) AS t;
         `;

      return db.one(sql, req.params.id);
    })
    .then(function (result){
      res.status(200).json(result);
    })
    .catch(next)
    .done();
}


exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.getFeeValue = getFeeValue;
