/**
* Cost Center Controller
*
* This controller exposes an API to the client for reading and writing Cost Center
*/

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const FilterParser = require('../../lib/filter');

// GET /cost_center
async function lookupCostCenter(id) {
  const sqlCostCenter = `
    SELECT fc.id, fc.label, fc.is_principal, fc.project_id,
      fc.allocation_method, fc.allocation_basis_id,
      cab.name AS allocation_basis_name, cab.units as allocation_basis_units,
      cab.is_predefined AS allocation_basis_is_predefined,
      cabval.quantity AS allocation_basis_quantity
    FROM cost_center as fc
    JOIN cost_center_allocation_basis as cab ON cab.id = fc.allocation_basis_id
    LEFT JOIN cost_center_allocation_basis_value AS cabval
      ON cabval.cost_center_id = fc.id AND cabval.basis_id = fc.allocation_basis_id
    WHERE fc.id = ?
    ORDER BY fc.label`;

  const sqlReferenceCostCenter = `
    SELECT id, cost_center_id, account_reference_id, is_cost, is_variable, is_turnover
    FROM reference_cost_center
    WHERE cost_center_id = ?`;

  const sqlServicesCostCenter = `
    SELECT service_cost_center.cost_center_id, BUID(service_cost_center.service_uuid) AS uuid, service.name
    FROM service_cost_center
    JOIN service ON service.uuid = service_cost_center.service_uuid
    WHERE cost_center_id = ?`;

  const [costCenter, references, services] = await Promise.all([
    db.exec(sqlCostCenter, [id]),
    db.exec(sqlReferenceCostCenter, [id]),
    db.exec(sqlServicesCostCenter, [id]),
  ]);

  // Collect the allocation basis data into one object
  costCenter.forEach(fc => {
    fc.allocation_basis = {
      id : fc.allocation_basis_id,
      name : fc.allocation_basis_name,
      units : fc.allocation_basis_units,
      is_predefined : fc.allocation_basis_is_predefined,
      // quantity???
    };
    delete fc.allocation_basis_id;
    delete fc.allocation_basis_name;
    delete fc.allocation_basis_units;
    delete fc.allocation_basis_is_predefined;
  });

  const data = {
    costCenter,
    references,
    services,
  };

  return data;
}

// Lists
function list(req, res, next) {
  const filters = new FilterParser(req.query, { tableAlias : 'f' });
  const sql = `
    SELECT f.id, f.label, f.is_principal, f.project_id,
      f.allocation_method, f.allocation_basis_id,
      GROUP_CONCAT(' ', LOWER(ar.description)) AS abbrs,
      GROUP_CONCAT(' ', s.name) serviceNames, p.name AS projectName,
      cab.name AS allocation_basis_name, cab.units as allocation_basis_units,
      cab.is_predefined AS allocation_basis_is_predefined,
      cabval.quantity AS allocation_basis_quantity
    FROM cost_center AS f
    LEFT JOIN cost_center_allocation_basis as cab ON cab.id = f.allocation_basis_id
    LEFT JOIN reference_cost_center AS r ON r.cost_center_id = f.id
    LEFT JOIN account_reference AS ar ON ar.id = r.account_reference_id
    LEFT JOIN service_cost_center AS sf ON sf.cost_center_id = f.id
    LEFT JOIN service AS s ON s.uuid = sf.service_uuid
    LEFT JOIN project AS p ON p.id = f.project_id
    LEFT JOIN cost_center_allocation_basis_value AS cabval
      ON cabval.cost_center_id = f.id AND cabval.basis_id = f.allocation_basis_id
    `;

  filters.equals('is_principal');
  filters.equals('allocation_method');
  //  filters.equals('allocation_basis');
  filters.setGroup('GROUP BY f.id');
  filters.setOrder('ORDER BY f.is_principal DESC, f.label ASC');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then((rows) => {
      // Collect the allocation basis data into one object
      rows.forEach(fc => {
        fc.allocation_basis = {
          id : fc.allocation_basis_id,
          name : fc.allocation_basis_name,
          units : fc.allocation_basis_units,
          is_predefined : fc.allocation_basis_is_predefined,
          // quantity???
        };
        delete fc.allocation_basis_id;
        delete fc.allocation_basis_name;
        delete fc.allocation_basis_units;
        delete fc.allocation_basis_is_predefined;
      });
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /cost_center/:ID
*
* Returns the detail of a single cost_center
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupCostCenter(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next);
}

// POST /cost_center
async function create(req, res, next) {
  try {
    const sql = `INSERT INTO cost_center SET ?`;
    const data = req.body;

    const costCenterData = {
      label : data.label,
      is_principal : data.is_principal,
      project_id : data.project_id,
      allocation_method : data.allocation_method,
      allocation_basis_id : data.allocation_basis_id,
    };

    const row = await db.exec(sql, [costCenterData]);
    const costCenterId = row.insertId;

    const transaction = db.transaction();

    if (data.reference_cost_center.length) {
      const dataReferences = data.reference_cost_center.map(item => [
        costCenterId,
        item.account_reference_id,
        item.is_cost,
        item.is_variable,
        item.is_turnover,
      ]);

      const sqlReferences = `
        INSERT INTO reference_cost_center
        (cost_center_id, account_reference_id, is_cost, is_variable, is_turnover) VALUES ?`;

      transaction
        .addQuery(sqlReferences, [dataReferences]);
    }

    if (data.services) {
      const dataServices = data.services.map(item => ([costCenterId, db.bid(item)]));
      const sqlServices = `
        INSERT INTO service_cost_center (cost_center_id, service_uuid) VALUES ?`;
      transaction
        .addQuery(sqlServices, [dataServices]);
    }

    const rows = await transaction.execute();
    res.status(201).json(rows);
  } catch (err) {
    next(err);
  }
}

// PUT /cost_center /:id
async function update(req, res, next) {
  const data = req.body;
  const transaction = db.transaction();

  try {

    const costCenterData = {
      label : data.label,
      is_principal : data.is_principal,
      project_id : data.project_id,
      allocation_method : data.allocation_method,
      allocation_basis_id : data.allocation_basis_id,
    };

    const sql = `UPDATE cost_center SET ? WHERE id = ?;`;
    const delReferences = `DELETE FROM reference_cost_center WHERE cost_center_id = ?;`;
    const delServices = `DELETE FROM service_cost_center WHERE cost_center_id = ?;`;
    const costCenterId = req.params.id;

    transaction
      .addQuery(sql, [costCenterData, costCenterId])
      .addQuery(delReferences, [costCenterId])
      .addQuery(delServices, [costCenterId]);

    if (data.reference_cost_center.length) {
      const dataReferences = data.reference_cost_center.map(item => [
        costCenterId,
        item.account_reference_id,
        item.is_cost,
        item.is_variable,
        item.is_turnover,
      ]);

      const sqlReferences = `
      INSERT INTO reference_cost_center
      (cost_center_id, account_reference_id, is_cost, is_variable, is_turnover) VALUES ?`;
      transaction
        .addQuery(sqlReferences, [dataReferences]);
    }

    if (data.services.length) {
      const dataServices = data.services.map(item => [
        costCenterId,
        // If we do not modify the services related to a cost center during the update,
        // these services remain of types objects reason for which one checks
        // the type finally to apply the appropriate formatting for each case
        db.bid(item.uuid || item),
      ]);

      const sqlServices = `
      INSERT INTO service_cost_center (cost_center_id, service_uuid) VALUES ?`;
      transaction
        .addQuery(sqlServices, [dataServices]);
    }

    await transaction.execute();
    const record = await lookupCostCenter(costCenterId);
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
}

// DELETE /cost_center/:id
function del(req, res, next) {
  const transaction = db.transaction();
  const costCenterId = req.params.id;

  const sql = `DELETE FROM cost_center WHERE id = ?;`;
  const delReferences = `DELETE FROM reference_cost_center WHERE cost_center_id = ?;`;
  const delServices = `DELETE FROM service_cost_center WHERE cost_center_id = ?;`;

  transaction
    .addQuery(delServices, [costCenterId])
    .addQuery(delReferences, [costCenterId])
    .addQuery(sql, [costCenterId]);

  transaction.execute()
    .then((rows) => {
      const { affectedRows } = rows.pop();
      // if there was no cost_center to delete, let the client know via a 404 error
      if (affectedRows === 0) {
        throw new NotFound(`Could not find a Cost Center with id ${costCenterId}.`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// This function searches for account membership at a cost center,
// and returns an object table that will allow when creating a transaction
async function getAllCostCenterAccounts() {
  const accountConfigCostCenter = [];

  const sql = `
    SELECT cc.id AS cost_center_id, cc.label AS cost_center_label, cc.is_principal, rfc.is_cost, a.id AS account_id,
      a.label AS accountLabel, a.number As accountNumber, ritem.is_exception, a.type_id
    FROM cost_center AS cc
    JOIN reference_cost_center AS rfc ON rfc.cost_center_id = cc.id
    JOIN account_reference AS ar ON ar.id = rfc.account_reference_id
    JOIN account_reference_item AS ritem ON ritem.account_reference_id = ar.id
    JOIN account AS a ON a.id = ritem.account_id;
  `;

  const sqlGetAccountNotTitle = `
    SELECT a.id AS account_id, a.label, a.number
    FROM account AS a
    WHERE a.type_id <> 6;
  `;

  const [accountsCostCenter, accountsNotTitle] = await Promise.all([
    db.exec(sql),
    db.exec(sqlGetAccountNotTitle),
  ]);

  accountsCostCenter.forEach(accountCostCenter => {
    accountsNotTitle.forEach(account => {
      if ((accountCostCenter.is_exception === 0)
        && ((`${account.number}`.indexOf(`${accountCostCenter.accountNumber}`, 0)) === 0)) {
        accountConfigCostCenter.push([
          {
            account_id : account.account_id,
            cost_center_id : accountCostCenter.cost_center_id,
            principal_center_id : accountCostCenter.is_principal ? accountCostCenter.cost_center_id : null,
          }]);
      }
    });
  });

  return accountConfigCostCenter;
}

// get list of costCenter
exports.list = list;
// get details of a costCenter
exports.detail = detail;
// create a new costCenter
exports.create = create;
// update costCenter informations
exports.update = update;
// delete a costCenter
exports.delete = del;
// get All Cost Center Accounts
exports.getAllCostCenterAccounts = getAllCostCenterAccounts;
