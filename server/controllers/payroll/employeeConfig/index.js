/**
* Employee Configuration Controller
*
* This controller exposes an API to the client for reading and writing Employee configuration
*/

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');

// GET /EMPLOYEE_CONFIG
function lookupEmployeeConfig(id) {
  const sql = `
    SELECT c.id, c.label
    FROM config_employee AS c
    WHERE c.id = ?`;

  return db.one(sql, [id]);
}

// Lists the Payroll Employee configurations
function list(req, res, next) {
  const sql = `
    SELECT c.id, c.label
    FROM config_employee AS c
  ;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET/EMPLOYEE_CONFIG/:ID
*
* Returns the detail of a single Employee Configuration
*/
function detail(req, res, next) {
  const id = req.params.id;

  lookupEmployeeConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /EMPLOYEE_CONFIG
function create(req, res, next) {
  const sql = `INSERT INTO config_employee SET ?`;
  const data = req.body;

  db.exec(sql, [data])
    .then((row) => {
      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}

// PUT/EMPLOYEE_CONFIG/:ID
function update(req, res, next) {
  const sql = `UPDATE config_employee SET ? WHERE id = ?;`;
  const data = db.convert(req.body, ['employee_uuid']);

  db.exec(sql, [data, req.params.id])
    .then(() => {
      return lookupEmployeeConfig(req.params.id);
    })
    .then((record) => {
    // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /EMPLOYEE_CONFIG/:ID
function del(req, res, next) {
  const sql = `DELETE FROM config_employee WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Employee configuration with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}


/**
 * POST /EMPLOYEE_CONFIG/: ID/ SETTING
 *
 * Creates and updates an Employee Configuration.  This works by completely deleting
 * the week days' configuration and then replacing them with the new Employee set.
 */
function createConfig(req, res, next) {

  const data = req.body.configuration.map((uuid) => {
    return [db.bid(uuid), req.params.id];
  });

  const transaction = db.transaction();

  transaction
    .addQuery('DELETE FROM config_employee_item WHERE config_employee_id = ?;', [req.params.id]);

  // if an array of configuration has been sent, add them to an INSERT query
  if (req.body.configuration.length) {
    transaction
      .addQuery('INSERT INTO config_employee_item (employee_uuid, config_employee_id) VALUES ?', [data]);
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
    SELECT id, config_employee_id, BUID(employee_uuid) AS employee_uuid  
      FROM config_employee_item
    WHERE config_employee_item.config_employee_id = ?;
  `;

  db.exec(sql, [req.params.id])
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}


// get list of Employee configuration
exports.list = list;

// get details of a Employee configuration
exports.detail = detail;

// create a new Employee configuration
exports.create = create;

// update Employee configurationinformations
exports.update = update;

// Delete a Employee configuration
exports.delete = del;

// Create or Update New Configuration of Payroll Week Days
exports.createConfig = createConfig;

// Get list of Week Days configured by Configuration
exports.listConfig = listConfig;
