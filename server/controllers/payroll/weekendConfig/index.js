/**
* Weekend Configuration Controller
*
* This controller exposes an API to the client for reading and writing Weekend configuration
*/

var db = require('../../../lib/db');
var NotFound = require('../../../lib/errors/NotFound');

// GET /WEEKEND_CONFIG
function lookupWeekendConfig(id) {
  var sql =`
    SELECT w.id, w.label
    FROM weekend_config AS w
    WHERE w.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Weekend configurations
function list(req, res, next) {
  const sql = `
    SELECT w.id, w.label
    FROM weekend_config AS w
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /WEEKEND_CONFIG/:ID
*
* Returns the detail of a single Weekend
*/
function detail(req, res, next) {
  var id = req.params.id;

  lookupWeekendConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /WEEKEND_CONFIG
function create(req, res, next) {
  const sql = `INSERT INTO weekend_config SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}


// PUT /WEEKEND_CONFIG /:ID
function update(req, res, next) {
  const sql = `UPDATE weekend_config SET ? WHERE id = ?;`;

  db.exec(sql, [req.body, req.params.id])
    .then(() => {
      return lookupWeekendConfig(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /WEEKEND_CONFIG /:ID
function del(req, res, next) {
  const sql = `DELETE FROM weekend_config WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Weekend configuration with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}


/**
 * POST /weekend_config/:id/setting
 *
 * Creates and updates a Week days' Configurations.  This works by completely deleting
 * the week days' configuration and then replacing them with the new week days' set.
 */
function createConfig(req, res, next) {
  const data = req.body.configuration.map((id) => {
    return [id, req.params.id];
  });

  const transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM config_week_days WHERE weekend_config_id = ?;', [req.params.id]);

  // if an array of configuration has been sent, add them to an INSERT query
  if (req.body.configuration.length) {
    transaction
      .addQuery('INSERT INTO config_week_days (indice, weekend_config_id) VALUES ?', [data]);
  }

  transaction.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();
}

/**
 * GET /weekend_config/:id/setting
*/
function listConfig(req, res, next) {
  const sql = `
    SELECT id, indice, weekend_config_id 
      FROM config_week_days
    WHERE config_week_days.weekend_config_id = ?;
  `;

  db.exec(sql, [req.params.id])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


// get list of Weekend configuration
exports.list = list;

// get details of a Weekend configuration
exports.detail = detail;

// create a new Weekend configuration
exports.create = create;

// update Weekend configurationinformations
exports.update = update;

// Delete a Weekend configuration
exports.delete = del;

// Create or Update New Configuration of Payroll Week Days
exports.createConfig = createConfig;

// Get list of Week Days configured by Configuration
exports.listConfig = listConfig;