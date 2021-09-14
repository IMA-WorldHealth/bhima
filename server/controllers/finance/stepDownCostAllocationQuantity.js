const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');

module.exports = {
  create,
  list,
  update,
  delete : remove,
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

// get details of all allocation base quantities
//
// GET /cost_center_allocation_basis_quantity
//   Uses two optional parameters:  basis_id, cost_center_id
//
function list(req, res, next) {
  const sql = 'SELECT * FROM cost_center_allocation_basis_value';
  const filters = new FilterParser(req.query);
  filters.equals('id');
  filters.equals('basis_id');
  filters.equals('cost_center_id');
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