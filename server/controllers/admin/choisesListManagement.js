/**
* CHOISES LIST MANAGEMENT Controller
*
* This controller exposes an API to the client for reading and writing CHOISES LIST MANAGEMENT
*/

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const FilterParser = require('../../lib/filter');

// GET /choises_list_management
function lookupChoisesListManagement(id) {
  const sql = `
    SELECT id, name, label, fixed, group_label, parent, is_title, is_group 
    FROM choises_list_management
    WHERE choises_list_management.id = ?`;

  return db.one(sql, [id]);
}

function list(req, res, next) {
  const filters = new FilterParser(req.query);

  const sql = `
    SELECT id, name, label, fixed, group_label, parent, is_title, is_group
    FROM choises_list_management
  `;

  filters.equals('is_title');
  filters.equals('is_group');
  filters.equals('parent');
  filters.equals('group_label');
  filters.setOrder('ORDER BY label');

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
* GET /choises_list_management/:ID
*
* Returns the detail of a single choises_list_management
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupChoisesListManagement(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /choises_list_management
function create(req, res, next) {
  const sql = `INSERT INTO choises_list_management SET ?`;
  const data = req.body;
  // Set 0 (root) like default parent
  data.parent = data.parent || 0;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /choises_list_management /:id
function update(req, res, next) {
  const sql = `UPDATE choises_list_management SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupChoisesListManagement(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /choises_list_management/:id
function remove(req, res, next) {
  const sql = `DELETE FROM choises_list_management WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a function with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of choisesListManagement
exports.list = list;

// get details of a choisesListManagement
exports.detail = detail;

// create a new choisesListManagement
exports.create = create;

// update choisesListManagement informations
exports.update = update;

// Delete a choisesListManagement
exports.delete = remove;
