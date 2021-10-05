const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');

module.exports = {
  create,
  list,
  update,
  delete : remove,
  bulkDetails,
  bulkCreate,
  bulkDelete,
  bulkUpdate,
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
    console.log('data:', data);
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
