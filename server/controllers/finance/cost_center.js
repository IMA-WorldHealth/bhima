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

/**
 * @method getAllCostCenterAccounts
 *
 * @description
 * This function returns the list of accounts (except title accounts)
 * with their corresponding cost center, the cost_center_id parameter
 * corresponds to the cost center reference, the principal_centre_id
 * parameter is entered if and only if the cost center is a main center
 *
 *If, during the configuration of the account references, a security account has been configured,
 * all the accounts which have the number of this account as index will be considered as belonging to this cost center.
 *
 * Eg. 61 belongs to the transport cost center,
 * 6101100, 6101101 and 6100444 will also belong to the transport cost cente
 */
function getAllCostCenterAccounts() {
  const accountTitle = 6;

  const sql = `
    SELECT aa.account_id, cc.id AS cost_center_id, IF(cc.is_principal, cost_center_id, NULL) AS principal_center_id
    FROM cost_center AS cc
    JOIN reference_cost_center AS rfc ON rfc.cost_center_id = cc.id
    JOIN account_reference AS ar ON ar.id = rfc.account_reference_id
    JOIN account_reference_item AS ritem ON ritem.account_reference_id = ar.id
    JOIN account AS a ON a.id = ritem.account_id
    JOIN (
    SELECT a.id AS account_id, a.label, a.number
    FROM account AS a
    WHERE a.type_id <> ${accountTitle}
    ) AS aa ON aa.number LIKE CONCAT(a.number ,'%')
    WHERE ritem.is_exception = 0;
  `;

  return db.exec(sql);
}

/**
 * @method assignCostCenterParams
 *
 * @description
 * This function examines in the object in parameter, the parameter
 * account_id and checks if this account corresponds to which cost
 * center and returns the same object with two new
 * parameters cost_center_id and principal_center_id
 * 
 * @param {String} accountsCostCenter - Is the correspondence of accounts with cost centers
 * @param {String} rubrics - The headings is a parameter which can be employee profits, social charges on remuneration or deduction
  * @param {String} params - This is the element with which the comparison will be made for the list of accounts by cost center
 */
function assignCostCenterParams(accountsCostCenter, rubrics, params) {

  accountsCostCenter.forEach(refCostCenter => {
    rubrics.forEach(rubric => {
      if (rubric[params] === refCostCenter.account_id) {
        rubric.cost_center_id = refCostCenter.cost_center_id;
        rubric.principal_center_id = refCostCenter.principal_center_id;
      }
    });
  });

  return rubrics;
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
// Assign Cost Center Params
exports.assignCostCenterParams = assignCostCenterParams;
