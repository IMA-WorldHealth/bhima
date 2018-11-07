/**
* Fee Center Controller
*
* This controller exposes an API to the client for reading and writing Fee Center
*/

const q = require('q');
const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

// GET /fee_center
function lookupFeeCenter(id) {

  const sqlFeeCenter = `
    SELECT id, label, is_principal FROM fee_center WHERE id = ?`;

  const sqlReferenceFeeCenter = `
    SELECT id, fee_center_id, account_reference_id, is_cost 
    FROM reference_fee_center 
    WHERE fee_center_id = ?`;

  const sqlServicesFeeCenter = `
    SELECT service_fee_center.fee_center_id, service_fee_center.service_id AS id, service.name
    FROM service_fee_center
    JOIN service ON service.id = service_fee_center.service_id
    WHERE fee_center_id = ?`;

  return q.all([
    db.exec(sqlFeeCenter, [id]),
    db.exec(sqlReferenceFeeCenter, [id]),
    db.exec(sqlServicesFeeCenter, [id]),
  ])
    .spread((feeCenter, references, services) => {
      const data = {
        feeCenter,
        references,
        services,
      };

      return data;
    });
}

// Lists
function list(req, res, next) {
  const sql = `
    SELECT f.id, f.label, f.is_principal, GROUP_CONCAT(' ', LOWER(ar.abbr)) AS abbrs, 
    GROUP_CONCAT(' ', s.name) serviceNames
    FROM fee_center AS f
    LEFT JOIN reference_fee_center AS r ON r.fee_center_id = f.id
    LEFT JOIN account_reference AS ar ON ar.id = r.account_reference_id
    LEFT JOIN service_fee_center AS sf ON sf.fee_center_id = f.id
    LEFT JOIN service AS s ON s.id = sf.service_id
    GROUP BY f.id
    ORDER BY f.is_principal DESC, f.label ASC;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /fee_center/:ID
*
* Returns the detail of a single fee_center
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupFeeCenter(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /fee_center
function create(req, res, next) {
  const sql = `INSERT INTO fee_center SET ?`;
  const data = req.body;

  const feeCenterData = {
    label : data.label,
    is_principal : data.is_principal,
  };

  db.exec(sql, [feeCenterData])
    .then((row) => {
      const feeCenterId = row.insertId;
      const transaction = db.transaction();

      if (data.reference_fee_center.length) {
        const dataReferences = data.reference_fee_center.map(item => [
          feeCenterId,
          item.account_reference_id,
          item.is_cost,
        ]);

        const sqlReferences = `
          INSERT INTO reference_fee_center (fee_center_id, account_reference_id, is_cost) VALUES ?`;
        transaction
          .addQuery(sqlReferences, [dataReferences]);
      }

      if (data.services) {
        const dataServices = data.services.map(item => [
          feeCenterId,
          item,
        ]);

        const sqlServices = `
          INSERT INTO service_fee_center (fee_center_id, service_id) VALUES ?`;
        transaction
          .addQuery(sqlServices, [dataServices]);
      }

      return transaction.execute();
    })
    .then((rows) => {
      res.status(201).json(rows);
    })
    .catch(next)
    .done();
}


// PUT /fee_center /:id
function update(req, res, next) {
  const data = req.body;
  const transaction = db.transaction();

  const feeCenterData = {
    label : data.label,
    is_principal : data.is_principal,
  };

  const sql = `UPDATE fee_center SET ? WHERE id = ?;`;
  const delReferences = `DELETE FROM reference_fee_center WHERE fee_center_id = ?;`;
  const delServices = `DELETE FROM service_fee_center WHERE fee_center_id = ?;`;
  const feeCenterId = req.params.id;

  transaction
    .addQuery(sql, [feeCenterData, feeCenterId])
    .addQuery(delReferences, [feeCenterId])
    .addQuery(delServices, [feeCenterId]);

  if (data.reference_fee_center.length) {
    const dataReferences = data.reference_fee_center.map(item => [
      feeCenterId,
      item.account_reference_id,
      item.is_cost,
    ]);

    const sqlReferences = `
      INSERT INTO reference_fee_center (fee_center_id, account_reference_id, is_cost) VALUES ?`;
    transaction
      .addQuery(sqlReferences, [dataReferences]);
  }
  
  if (data.services.length) {
    const dataServices = data.services.map(item => [
      feeCenterId,
      //If we do not modify the services related to a cost center during the update, 
      //these services remain of types objects reason for which one checks 
      //the type finally to apply the appropriate formatting for each case
      item.id || item,
    ]);

    const sqlServices = `
      INSERT INTO service_fee_center (fee_center_id, service_id) VALUES ?`;
    transaction
      .addQuery(sqlServices, [dataServices]);
  }

  return transaction.execute()
    .then(() => {
      return lookupFeeCenter(feeCenterId);
    })
    .then((record) => {
      // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /fee_center/:id
function del(req, res, next) {
  const transaction = db.transaction();
  const feeCenterId = req.params.id;

  const sql = `DELETE FROM fee_center WHERE id = ?;`;
  const delReferences = `DELETE FROM reference_fee_center WHERE fee_center_id = ?;`;
  const delServices = `DELETE FROM service_fee_center WHERE fee_center_id = ?;`;


  transaction
    .addQuery(delServices, [feeCenterId])
    .addQuery(delReferences, [feeCenterId])
    .addQuery(sql, [feeCenterId]);

  transaction.execute()
    .then((rows) => {
      // if nothing happened, let the client know via a 404 error
      if (rows.affectedRows === 0) {
        throw new NotFound(`Could not find a Fee Center with id ${feeCenterId}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of feeCenter
exports.list = list;
// get details of a feeCenter
exports.detail = detail;
// create a new feeCenter
exports.create = create;
// update feeCenter informations
exports.update = update;
// Delete a feeCenter
exports.delete = del;
