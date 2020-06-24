/**
* Fee Center Controller
*
* This controller exposes an API to the client for reading and writing Fee Center
*/

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const FilterParser = require('../../lib/filter');

// GET /fee_center
async function lookupFeeCenter(id) {
  const sqlFeeCenter = `
    SELECT id, label, is_principal, project_id FROM fee_center WHERE id = ?`;

  const sqlReferenceFeeCenter = `
    SELECT id, fee_center_id, account_reference_id, is_cost, is_variable, is_turnover
    FROM reference_fee_center
    WHERE fee_center_id = ?`;

  const sqlServicesFeeCenter = `
    SELECT service_fee_center.fee_center_id, BUID(service_fee_center.service_uuid) AS uuid, service.name
    FROM service_fee_center
    JOIN service ON service.uuid = service_fee_center.service_uuid
    WHERE fee_center_id = ?`;

  const [feeCenter, references, services] = await Promise.all([
    db.exec(sqlFeeCenter, [id]),
    db.exec(sqlReferenceFeeCenter, [id]),
    db.exec(sqlServicesFeeCenter, [id]),
  ]);

  const data = {
    feeCenter,
    references,
    services,
  };

  return data;
}

// Lists
function list(req, res, next) {
  const filters = new FilterParser(req.query, { tableAlias : 'f' });
  const sql = `
    SELECT f.id, f.label, f.is_principal, f.project_id, GROUP_CONCAT(' ', LOWER(ar.description)) AS abbrs,
    GROUP_CONCAT(' ', s.name) serviceNames, p.name AS projectName
    FROM fee_center AS f
    LEFT JOIN reference_fee_center AS r ON r.fee_center_id = f.id
    LEFT JOIN account_reference AS ar ON ar.id = r.account_reference_id
    LEFT JOIN service_fee_center AS sf ON sf.fee_center_id = f.id
    LEFT JOIN service AS s ON s.uuid = sf.service_uuid
    LEFT JOIN project AS p ON p.id = f.project_id`;

  filters.equals('is_principal');
  filters.setGroup('GROUP BY f.id');
  filters.setOrder('ORDER BY f.is_principal DESC, f.label ASC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
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
    .catch(next);
}

// POST /fee_center
async function create(req, res, next) {
  try {
    const sql = `INSERT INTO fee_center SET ?`;
    const data = req.body;

    const feeCenterData = {
      label : data.label,
      is_principal : data.is_principal,
      project_id : data.project_id,
    };

    const row = await db.exec(sql, [feeCenterData]);
    const feeCenterId = row.insertId;

    const transaction = db.transaction();

    if (data.reference_fee_center.length) {
      const dataReferences = data.reference_fee_center.map(item => [
        feeCenterId,
        item.account_reference_id,
        item.is_cost,
        item.is_variable,
        item.is_turnover,
      ]);

      const sqlReferences = `
        INSERT INTO reference_fee_center
        (fee_center_id, account_reference_id, is_cost, is_variable, is_turnover) VALUES ?`;

      transaction
        .addQuery(sqlReferences, [dataReferences]);
    }

    if (data.services) {
      const dataServices = data.services.map(item => ([feeCenterId, db.bid(item)]));
      const sqlServices = `
        INSERT INTO service_fee_center (fee_center_id, service_uuid) VALUES ?`;
      transaction
        .addQuery(sqlServices, [dataServices]);
    }

    const rows = await transaction.execute();
    res.status(201).json(rows);
  } catch (err) {
    next(err);
  }
}

// PUT /fee_center /:id
async function update(req, res, next) {
  const data = req.body;
  const transaction = db.transaction();

  try {

    const feeCenterData = {
      label : data.label,
      is_principal : data.is_principal,
      project_id : data.project_id,
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
        item.is_variable,
        item.is_turnover,
      ]);

      const sqlReferences = `
      INSERT INTO reference_fee_center
      (fee_center_id, account_reference_id, is_cost, is_variable, is_turnover) VALUES ?`;
      transaction
        .addQuery(sqlReferences, [dataReferences]);
    }

    if (data.services.length) {
      const dataServices = data.services.map(item => [
        feeCenterId,
        // If we do not modify the services related to a cost center during the update,
        // these services remain of types objects reason for which one checks
        // the type finally to apply the appropriate formatting for each case
        db.bid(item.uuid || item),
      ]);

      const sqlServices = `
      INSERT INTO service_fee_center (fee_center_id, service_uuid) VALUES ?`;
      transaction
        .addQuery(sqlServices, [dataServices]);
    }

    await transaction.execute();
    const record = await lookupFeeCenter(feeCenterId);
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
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
      const { affectedRows } = rows.pop();
      // if there was no fee_center to delete, let the client know via a 404 error
      if (affectedRows === 0) {
        throw new NotFound(`Could not find a Fee Center with id ${feeCenterId}.`);
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
// delete a feeCenter
exports.delete = del;
