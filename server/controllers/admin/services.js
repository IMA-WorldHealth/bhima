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
      s.name, BUID(s.uuid) AS uuid, s.hidden,
      p.id AS project_id, p.name AS project_name
    FROM service AS s
    LEFT JOIN project AS p ON s.project_id = p.id`;

  if (req.query.full === '1') {
    sql = `
      SELECT s.name, s.enterprise_id, BUID(s.uuid) AS uuid, s.hidden,
      e.name AS enterprise_name, e.abbr, p.id AS project_id, p.name AS project_name
      FROM service AS s
      JOIN enterprise AS e ON s.enterprise_id = e.id
      LEFT JOIN project AS p ON s.project_id = p.id`;
  }

  const params = db.convert(req.query, ['uuid']);
  const filters = new FilterParser({ ...params, tableAlias : 's' });

  filters.equals('uuid');
  filters.equals('name');
  filters.equals('hidden');
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

  // service unique uuid as entity uuid
  const uid = uuid();
  record.uuid = db.bid(uid);

  db.exec(sql, [record])
    .then(() => {
      res.status(201).json({ uuid : uid });
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
  const sql = `UPDATE service SET ? WHERE uuid = ?;`;

  delete queryData.uuid;

  db.exec(sql, [queryData, db.bid(req.params.uuid)])
    .then((result) => {
      if (!result.affectedRows) {
        throw new NotFound(`Could not find a service with uuid ${req.params.uuid}.`);
      }

      return lookupService(req.params.uuid);
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
  db.delete('service', 'uuid', db.bid(req.params.uuid), res, next,
    `Could not find a service with uuid ${req.params.uuid}`);
}

/**
 * @method detail
 *
 * @description
 * Return a service details from the database
 */
function detail(req, res, next) {
  lookupService(req.params.uuid)
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
 * @param {String} uid - the uuid of a service
 * @returns {Promise} - returns the result of teh database query
 */
function lookupService(uid) {
  const sql = `
    SELECT
      BUID(s.uuid) AS uuid, s.name, s.enterprise_id, s.hidden,
      p.id AS project_id, p.name AS project_name
    FROM
      service AS s LEFT JOIN project p ON p.id = s.project_id
    WHERE
      s.uuid = ?;`;

  return db.one(sql, db.bid(uid), uid, 'service');
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.countServiceByProject = countServiceByProject;
exports.lookupService = lookupService;
