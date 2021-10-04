const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');
const constants = require('../../config/constants');

module.exports = {
  create,
  list,
  update,
  delete : remove,
  bulkDetails,
  bulkCreate,
  bulkDelete,
  bulkUpdate,
  updateQuantities,
};

// add a new allocation basis quantity
//
// POST /cost_center_allocation_basis_quantity
//
function create(req, res, next) {
  const sql = `INSERT INTO cost_center_allocation_basis_value SET ?`;
  const data = req.body;
  db.exec(sql, data)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

// get details of all allocation base quantities for a given cost center
//
// GET /cost_center_allocation_basis_quantity/bulk/:id
//
async function bulkDetails(req, res, next) {
  const sql = `
    SELECT
      abv.id, abv.quantity, abv.cost_center_id, abv.basis_id,
      cc.label AS cost_center_label, ab.name AS allocation_basis_label, ab.units AS allocation_basis_units
    FROM cost_center_allocation_basis_value abv
    JOIN cost_center cc ON cc.id = abv.cost_center_id
    JOIN cost_center_allocation_basis ab ON ab.id = abv.basis_id
    WHERE cc.id = ?
  `;
  try {
    const data = await db.exec(sql, [+req.params.id]);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

// add multiple new allocation basis quantity
//
// POST /cost_center_allocation_basis_quantity/bulk
//
function bulkCreate(req, res, next) {
  const data = req.body.params;
  const sql = `INSERT INTO cost_center_allocation_basis_value SET ?`;
  const tx = db.transaction();

  data.forEach(item => {
    tx.addQuery(sql, item);
  });

  tx.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

// update multiple allocation basis quantity
//
// PUT /cost_center_allocation_basis_quantity/bulk
//
function bulkUpdate(req, res, next) {
  const ccId = req.params.id;
  const data = req.body.params;
  const sql = `INSERT INTO cost_center_allocation_basis_value SET ?`;
  const tx = db.transaction();

  tx.addQuery('DELETE FROM cost_center_allocation_basis_value WHERE cost_center_id = ?;', [ccId]);

  data.forEach(item => {
    tx.addQuery(sql, { cost_center_id : ccId, ...item });
  });

  tx.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

// remove multiple new allocation basis quantity
//
// DELETE /cost_center_allocation_basis_quantity/bulk
//
function bulkDelete(req, res, next) {
  const ccId = req.params.id;
  const sql = `DELETE FROM cost_center_allocation_basis_value WHERE cost_center_id = ?`;

  db.exec(sql, [ccId])
    .then(() => {
      res.sendStatus(203);
    })
    .catch(next)
    .done();
}

// get details of all allocation base quantities
//
// GET /cost_center_allocation_basis_quantity
//   Uses two optional parameters:  basis_id, cost_center_id
//
function list(req, res, next) {
  const sql = `
    SELECT
      abv.id, abv.quantity, abv.cost_center_id, abv.basis_id,
      cc.label AS cost_center_label, ab.name AS allocation_basis_label, ab.units AS allocation_basis_units
    FROM cost_center_allocation_basis_value abv
    JOIN cost_center cc ON cc.id = abv.cost_center_id
    JOIN cost_center_allocation_basis ab ON ab.id = abv.basis_id
  `;
  const filters = new FilterParser(req.query);
  filters.equals('id', 'id', 'abv');
  filters.equals('basis_id', 'basis_id', 'abv');
  filters.equals('cost_center_id', 'cost_center_id', 'abv');
  const query = filters.applyQuery(sql);
  const params = filters.parameters();

  return db.exec(query, params)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

// update allocation basis quantity details
//
// PUT /cost_center_allocation_basis_quantity/:id
//
function update(req, res, next) {
  const sql = 'UPDATE cost_center_allocation_basis_value SET ?  WHERE id = ?';
  const data = req.body;
  db.exec(sql, [data, req.params.id])
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next)
    .done();
}

// Delete a allocation basis quantity
//
// DELETE /cost_center_allocation_basis_quantity/:id
//
function remove(req, res, next) {
  const sql = 'DELETE FROM cost_center_allocation_basis_value WHERE id = ?';
  db.exec(sql, req.params.id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
}

// Update computable allocation basis quantities
//
// UPDATE /cost_center_allocation_basis_quantities_update
//

async function updateQuantities(req, res, next) {

  try {
    // Get the full list of cost center IDs
    const costCentersQuery = 'SELECT id, label AS name from cost_center';
    const costCenters = await db.exec(costCentersQuery);

    // Get the allocation bases that are computable
    const cabQuery = 'SELECT id, name FROM cost_center_allocation_basis WHERE is_computed = 1';
    const computables = await db.exec(cabQuery);

    // Queries to update the quantity records
    const findQRec = 'SELECT id FROM `cost_center_allocation_basis_value` '
      + 'WHERE `cost_center_id` = ? AND `basis_id` = ?';
    const updateQRec = 'UPDATE `cost_center_allocation_basis_value` '
      + 'SET `quantity` = ? WHERE `id` = ?';
    const insertQRec = 'INSERT INTO `cost_center_allocation_basis_value` '
      + '(`cost_center_id`, `basis_id`, `quantity`) VALUES (?, ?, ?)';

    // Compute and set each computable allocation basis quantity
    const unUpdatedCenters = [];

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < computables.length; i++) {
      const basis = computables[i];
      const data = await allocationQuantities(basis.id);

      // Update quantities for each cost center
      for (let k = 0; k < costCenters.length; k++) {
        const cc = costCenters[k];

        // Get the data for this cost center (if any)
        const ccData = data.find(item => item.cost_center_id === cc.id);
        if (ccData) {
          const newQuantity = ccData[basis.name];
          // See if there is an existing quantity
          const qRecordId = await db.exec(findQRec, [cc.id, basis.id]);
          if (qRecordId.length > 0) {
            // console.log("Updating: ", newQuantity, qRecordId[0].id);
            await db.exec(updateQRec, [newQuantity, qRecordId[0].id]);
          } else {
            // console.log("Inserting: ", cc.id, basis.id, newQuantity);
            await db.exec(insertQRec, [cc.id, basis.id, newQuantity]);
          }
        } else {
          // TODO:  Do we want to zero out the others here?
          unUpdatedCenters.push({ cc });
        }
      }
    }

    // TODO: Do something with upUpdateCenters to inform the user
    // console.log("Centers not updated: ", unUpdatedCenters);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

/**
 * Get cost allocation basis quantities
 *
 * This function returns a set of values for the specified
 * allocation_basis_id for each cost center.
 *
 * @param {Number} allocation_basis_id
 */
function allocationQuantities(allocationBasisId) {
  let query = null;
  if (allocationBasisId === constants.allocationBasis.ALLOCATION_BASIS_NUM_EMPLOYEES) {
    // Set up the query for number of employees
    query = `
      SELECT BUID(service.uuid) AS service_uuid, service.name AS service_name,
        COUNT(employee.uuid) AS ALLOCATION_BASIS_NUM_EMPLOYEES,
        GetCostCenterByServiceUuid(service.uuid) as cost_center_id
      FROM service JOIN employee ON service.uuid = employee.service_uuid
      GROUP BY service.uuid;
  `;
  } else {
    return [];
  }
  return db.exec(query);
}
