/**
* Weekend Configuration Controller
*
* This controller exposes an API to the client for reading and writing Weekend configuration
*/

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');

// GET /WEEKEND_CONFIG
function lookupWeekendConfig(id) {
  const sql = `
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
  const { id } = req.params;

  lookupWeekendConfig(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// POST /WEEKEND_CONFIG
async function create(req, res, next) {
  try {
    const sql = `INSERT INTO weekend_config SET ?`;
    const data = req.body;
    const configuration = data.daysChecked;
    delete data.daysChecked;

    const { insertId } = await db.exec(sql, [data]);
    const dataConfigured = configuration.map(id => ([id, insertId]));
    await db.exec('INSERT INTO config_week_days (indice, weekend_config_id) VALUES ?', [dataConfigured]);
    res.status(201).json({ id : insertId });
  } catch (error) {
    next(error);
  }
}

// PUT /WEEKEND_CONFIG /:ID
function update(req, res, next) {
  const transaction = db.transaction();
  const data = req.body;
  const dataconfigured = data.daysChecked.map((id) => {
    return [id, req.params.id];
  });

  delete data.daysChecked;

  transaction
    .addQuery('UPDATE weekend_config SET ? WHERE id = ?;', [data, req.params.id])
    .addQuery('DELETE FROM config_week_days WHERE weekend_config_id = ?;', [req.params.id]);

  // if an array of configuration has been sent, add them to an INSERT query
  if (dataconfigured.length) {
    transaction
      .addQuery('INSERT INTO config_week_days (indice, weekend_config_id) VALUES ?', [dataconfigured]);
  }

  transaction.execute()
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

// Get list of Week Days configured by Configuration
exports.listConfig = listConfig;
