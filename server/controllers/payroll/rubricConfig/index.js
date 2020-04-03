/**
* Rubrics Configuration Controller
*
* This controller exposes an API to the client for reading and writing Rubric Configuration
*/

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');

// GET /RubricConfig
function lookupRubricConfig(id) {
  const sql = `
    SELECT c.id, c.label FROM config_rubric AS c WHERE c.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll RubricConfigs
function list(req, res, next) {
  const sql = `
    SELECT c.id, c.label FROM config_rubric AS c
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /RubricConfig/:ID
*
* Returns the detail of a single RubricConfig
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupRubricConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /RubricConfig
function create(req, res, next) {
  const sql = `INSERT INTO config_rubric SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /RubricConfig /:id
function update(req, res, next) {
  const sql = `UPDATE config_rubric SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupRubricConfig(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /RubricConfig/:id
function del(req, res, next) {
  const sql = `DELETE FROM config_rubric WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a RubricConfig with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

/**
 * GET /rubric_config/:id/setting
 * This function returns the list of items configured for a pay period
*/
function listConfig(req, res, next) {
  const sql = `
    SELECT config_rubric_item.id, config_rubric_item.config_rubric_id, config_rubric_item.rubric_payroll_id
      FROM config_rubric_item
    WHERE config_rubric_item.config_rubric_id = ?;
  `;

  db.exec(sql, [req.params.id])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


/**
 * POST /rubric_config/:id/setting
 *
 * Creates and updates a Rubric's Configurations.  This works by completely deleting
 * the rubric's configuration and then replacing them with the new rubrics set.
 */
function createConfig(req, res, next) {
  const data = req.body.configuration.map((id) => {
    return [id, req.params.id];
  });

  const transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM config_rubric_item WHERE config_rubric_id = ?;', [req.params.id]);

  // if an array of configuration has been sent, add them to an INSERT query
  if (req.body.configuration.length) {
    transaction
      .addQuery('INSERT INTO config_rubric_item (rubric_payroll_id, config_rubric_id) VALUES ?', [data]);
  }

  transaction.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

// get list of Rubrics Configurations
exports.list = list;

// get details of a Rubric Configuration
exports.detail = detail;

// create a new Rubric Configuration
exports.create = create;

// update Rubric Configuration
exports.update = update;

// Delete a Rubric Configuration
exports.delete = del;

// Create or Update New Configuration of Payroll Rubrics
exports.createConfig = createConfig;

// Get list of Rubrics configured by Configuration
exports.listConfig = listConfig;
