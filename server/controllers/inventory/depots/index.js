/**
* Depot Controller
*
* This controller is mostly responsible for depot-dependent stock queries.  Most
* routes require that a depot ID is specified.  Any route without a depot ID
* might be better positioned in the /inventory/ controller.
*
* @todo(jniles) - review this module
*/
const _ = require('lodash');

const { uuid } = require('../../../lib/util');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const BadRequest = require('../../../lib/errors/BadRequest');
const FilterParser = require('../../../lib/filter');

/** expose depots routes */
exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.searchByName = searchByName;

/**
* POST /depots
* Create a new depot in the database
*
* @function create
*/
function create(req, res, next) {
  const query = 'INSERT INTO depot SET ?';

  // prevent missing uuid by generating a new one
  const depotUuid = req.body.uuid || uuid();
  req.body.uuid = db.bid(depotUuid);

  // convert the location uuid into binary
  req.body = db.convert(req.body, ['location_uuid']);

  // enterprise for the depot
  req.body.enterprise_id = req.session.enterprise.id;

  db.exec(query, [req.body])
    .then(() => {
      res.status(201).json({ uuid : depotUuid });
    })
    .catch(next)
    .done();
}

/**
* DELETE /depots
* delete an existing depot in the database
*
* @function remove
*/
function remove(req, res, next) {
  const query = 'DELETE FROM depot WHERE uuid = ?';
  const uid = db.bid(req.params.uuid);

  db.exec(query, [uid])
    .then(() => {
      res.status(204).send({});
    })
    .catch(next)
    .done();
}

/**
* PUT /depots
* Edit an existing depot in the database
*
* @function update
*/
function update(req, res, next) {
  const query = 'UPDATE depot SET ? WHERE uuid = ?';
  const uid = db.bid(req.params.uuid);

  // prevent updating the uuid by accident
  if (req.body.uuid) { delete req.body.uuid; }

  // convert the location uuid into binary
  req.body = db.convert(req.body, ['location_uuid']);

  db.exec(query, [req.body, uid])
    .then(() => {
      const sql = `
        SELECT BUID(uuid) as uuid, text, enterprise_id, is_warehouse,
          allow_entry_purchase, allow_entry_donation, allow_entry_integration, allow_entry_transfer,
          allow_exit_debtor, allow_exit_service, allow_exit_transfer, allow_exit_loss
        FROM depot WHERE uuid = ?`;
      return db.exec(sql, [uid]);
    })
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound(`Could not find a depot with uuid ${req.params.uuid}`);
      }
      res.status(200).send(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /depots
* Fetches all depots in the database
*
* @function list
*/
function list(req, res, next) {
  const options = db.convert(req.query, ['uuid', 'uuids', 'exception']);

  if (options.only_user) {
    options.user_id = req.session.user.id;
  }

  options.enterprise_id = req.session.enterprise.id;

  const filters = new FilterParser(options, { tableAlias : 'd' });

  const sql = `
    SELECT
      BUID(d.uuid) as uuid, d.text, d.is_warehouse,
      d.allow_entry_purchase, d.allow_entry_donation, d.allow_entry_integration,
      d.allow_entry_transfer, d.allow_exit_debtor, d.allow_exit_service,
      d.allow_exit_transfer, d.allow_exit_loss, BUID(d.location_uuid) AS location_uuid,
      v.name as village_name, s.name as sector_name, p.name as province_name, c.name as country_name
    FROM depot d
    LEFT JOIN village v ON v.uuid = d.location_uuid
    LEFT JOIN sector s ON s.uuid = v.sector_uuid
    LEFT JOIN province p ON p.uuid = s.province_uuid
    LEFT JOIN country c ON c.uuid = p.country_uuid
  `;

  filters.custom(
    'user_id',
    'd.uuid IN (SELECT depot_permission.depot_uuid FROM depot_permission WHERE depot_permission.user_id = ?)',
  );
  filters.custom(
    'exception',
    'd.uuid NOT IN (?)',
  );
  filters.fullText('text', 'text', 'd');
  filters.equals('is_warehouse', 'is_warehouse', 'd');
  filters.equals('uuid', 'uuid', 'd');
  hasUuids(options.uuids, filters);
  filters.equals('enterprise_id', 'enterprise_id', 'd');
  filters.setOrder('ORDER BY d.text');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

function hasUuids(uuids, filters) {
  if (!uuids) return;
  const n = [].concat(uuids).length;
  let qs = '';
  for (let i = 0; i < n; i++) {
    qs = (i === (n - 1)) ? `${qs}?` : qs = `${qs}?,`;
  }
  filters.custom('uuids', `d.uuid IN (${qs})`);
}
/*
 * @method searchByName
 *
 * @description
 * This method implements a depot search that will only return very limited information
 */
function searchByName(req, res, next) {
  const options = {};
  options.text = req.query.text;
  options.exception = req.query.exception;
  options.limit = req.query.limit || 10;
  options.enterprise_id = req.session.enterprise.id;

  if (_.isUndefined(options.text)) {
    return next(new BadRequest('text attribute must be specified for a name search'));
  }

  db.convert(options, ['exception']);

  const filters = new FilterParser(options, { tableAlias : 'd' });

  const sql = `
    SELECT
      BUID(d.uuid) as uuid, d.text, d.is_warehouse,
      d.allow_entry_purchase, d.allow_entry_donation, d.allow_entry_integration,
      d.allow_entry_transfer, d.allow_exit_debtor, d.allow_exit_service,
      d.allow_exit_transfer, d.allow_exit_loss, BUID(d.location_uuid) AS location_uuid,
      v.name as village_name, s.name as sector_name, p.name as province_name, c.name as country_name
    FROM depot d
      LEFT JOIN village v ON v.uuid = d.location_uuid
      LEFT JOIN sector s ON s.uuid = v.sector_uuid
      LEFT JOIN province p ON p.uuid = s.province_uuid
      LEFT JOIN country c ON c.uuid = p.country_uuid
  `;

  filters.custom(
    'exception',
    'd.uuid NOT IN (?)',
  );
  filters.fullText('text', 'text', 'd');
  filters.equals('enterprise_id', 'enterprise_id', 'd');
  filters.setOrder('ORDER BY d.text');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  return db.exec(query, parameters)
    .then((results) => res.send(results))
    .catch(next)
    .done();
}

/**
* GET /depots/:uuid
* Fetches a depot by its uuid from the database
*
* @function detail
*/
function detail(req, res, next) {
  const options = req.query;

  const uid = db.bid(req.params.uuid);

  const sql = `
    SELECT
      BUID(d.uuid) as uuid, d.text, d.is_warehouse,
      allow_entry_purchase, allow_entry_donation, allow_entry_integration, allow_entry_transfer,
      allow_exit_debtor, allow_exit_service, allow_exit_transfer, allow_exit_loss
    FROM depot AS d
    WHERE d.enterprise_id = ? AND d.uuid = ? `;

  const requireUserPermissions = ` AND
    d.uuid IN (SELECT depot_permission.depot_uuid FROM depot_permission WHERE depot_permission.user_id = ?)
  `;

  const query = options.only_user ? sql.concat(requireUserPermissions) : sql;

  db.one(query, [req.session.enterprise.id, uid, req.session.user.id])
    .then((row) => {
    // return the json
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}
