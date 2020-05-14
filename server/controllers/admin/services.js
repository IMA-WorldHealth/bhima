/**
 * @overview Services
 *
 * @description
 * The /services HTTP API endpoint
 *
 * @description
 * This controller is responsible for implementing all crud and others custom request
 * on the services table through the `/services` endpoint.
 *
 * @requires lib/util
 * @requires db
 * @requires NotFound
 */

const db = require('../../lib/db');
const { uuid } = require('../../lib/util');
const NotFound = require('../../lib/errors/NotFound');
const FilterParser = require('../../lib/filter');

/**
 * @method list
 *
 * @description
 * Returns an array of services from the database.
 */
function list(req, res, next) {
  let sql = `
    SELECT
      s.id, s.name,  BUID(s.uuid) AS uuid, s.hidden,
      p.id AS project_id, p.name AS project_name
    FROM service AS s
    LEFT JOIN project AS p ON s.project_id = p.id`;

  if (req.query.full === '1') {
    sql = `
      SELECT s.id, s.name, s.enterprise_id, BUID(s.uuid) AS uuid, s.hidden,
      e.name AS enterprise_name, e.abbr, p.id AS project_id, p.name AS project_name
      FROM service AS s
      JOIN enterprise AS e ON s.enterprise_id = e.id
      LEFT JOIN project AS p ON s.project_id = p.id`;
  }

  const params = db.convert(req.query, ['uuid']);
  const filters = new FilterParser(params);

  filters.equals('uuid', 'uuid', 's');
  filters.equals('name', 'name', 's');
  filters.setOrder('ORDER BY s.name');

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();

  db.exec(query, queryParameters)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

function countServiceByProject(req, res, next) {
  const sql = `
  SELECT p.name AS project_name, p.abbr AS project_abbr, COUNT(*) AS total
  FROM service AS s
  LEFT JOIN project AS p ON s.project_id = p.id
  GROUP BY p.id ORDER BY s.name;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method create
 *
 * @description
 * Create a service in the database
 */
function create(req, res, next) {
  const record = req.body;
  const sql = `INSERT INTO service SET ?`;

  // add contextual information
  record.enterprise_id = req.session.enterprise.id;

  delete record.id;

  // service unique uuid as entity uuid
  record.uuid = db.bid(uuid());

  db.exec(sql, [record])
    .then((result) => {
      res.status(201).json({ id : result.insertId });
    })
    .catch(next)
    .done();
}

/**
* Update a service in the database
*
* @param {object} req The express request object
* @param {object} res The express response object
* @param {object} next The express object to pass the controle to the next middleware
*
* @example
* // PUT /services : update a service
* let services = require('admin/services');
* services.update(req, res, next);
*/
function update(req, res, next) {
  const queryData = req.body;
  const sql = `UPDATE service SET ? WHERE id = ?;`;

  delete queryData.id;
  delete queryData.uuid;

  db.exec(sql, [queryData, req.params.id])
    .then((result) => {
      if (!result.affectedRows) {
        throw new NotFound(`Could not find a service with id ${req.params.id}.`);
      }

      return lookupService(req.params.id);
    })
    .then((service) => {
      res.status(200).json(service);
    })
    .catch(next)
    .done();
}

/**
 * @method remove
 *
 * @description
 * Remove a service in the database.
 */
function remove(req, res, next) {
  db.delete('service', 'id', req.params.id, res, next, `Could not find a service with id ${req.params.id}`);
}

/**
 * @method detail
 *
 * @description
 * Return a service details from the database
 */
function detail(req, res, next) {
  lookupService(req.params.id)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * @method lookupService
 *
 * @description
 * Return a service instance from the database
 *
 * @param {Number} id - the id of a service
 * @returns {Promise} - returns the result of teh database query
 */
function lookupService(id) {
  const sql = `
    SELECT
      s.id, s.name, s.enterprise_id, s.hidden,
      p.id AS project_id, p.name AS project_name
    FROM
      service AS s
    LEFT JOIN project p ON p.id = s.project_id
    WHERE
      s.id = ?;`;

  return db.one(sql, id, id, 'service');
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.countServiceByProject = countServiceByProject;
exports.lookupService = lookupService;
