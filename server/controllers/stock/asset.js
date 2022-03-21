/**
 * Stock Asset Controller
 */
const db = require('../../lib/db');
const util = require('../../lib/util');
const _ = require('lodash');

const FilterParser = require('../../lib/filter');

/**
  * @function binarize
  *
  * @description
  * returns binary version of given identifiers (uuids)
  *
  * @param {object} params an object which contains identifiers in string format
  * @returns {object} params with binary identifiers
  */
function binarize(params) {
  return db.convert(params, [
    'uuid',
    'asset_uuid',
    'depot_uuid',
    'group_uuid',
    'inventory_uuid',
    'location_uuid',
  ]);
}

/**
 * @function conditions
 *
 * @description return the asset conditions (untranslated)
 *
 * GET /asset/conditions
 */
exports.conditions = (req, res, next) => {
  db.exec('SELECT * FROM asset_condition')
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
};

/**
 * @function getAssetScanFilters
 *
 * @description
 * Groups all filtering functionality used in the different getLots* functions into
 * a single function.  The filterparser is returned so that any additional modifications
 * can be made in the function before execution.
 *
 * @param {Object} parameters - an object of filter params.
 */
function getAssetScanFilters(parameters) {
  // clone the parameters
  const params = binarize({ ...parameters });

  // Construct the filters
  const filters = new FilterParser(params, { tableAlias : 's' });

  filters.equals('uuid');
  filters.equals('asset_uuid', 'uuid', 'l');
  filters.equals('asset_label', 'label', 'l');
  filters.equals('location_uuid');
  filters.equals('depot_uuid');
  filters.equals('group_uuid');
  filters.equals('inventory_uuid');
  filters.equals('scanned_by');
  filters.equals('condition_id', 'id', 'ac');
  filters.dateFrom('start_date', 'updated_at');
  filters.dateTo('end_date', 'updated_at');

  return filters;
}

/**
 * @function getAssetScans
 *
 * GET /asset/scans
 */
exports.getAssetScan = async function getAssetScan(req, res, next) {
  try {
    const rows = await listAssetScans(req.params);
    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @function getAssetScans
 *
 * GET /asset/scans
 */
exports.getAssetScans = async function getAssetScans(req, res, next) {
  const params = req.query;
  try {
    const rows = await listAssetScans(params);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// Get the asset scans
function listAssetScans(params) {
  const filters = getAssetScanFilters(params);

  const sql = `
    SELECT
      BUID(s.uuid) AS uuid, BUID(s.asset_uuid) AS asset_uuid,
      BUID(s.location_uuid) AS location_uuid, BUID(s.depot_uuid) AS depot_uuid,
      s.scanned_by, s.condition_id, s.notes, s.created_at, s.updated_at,
      l.label AS asset_label, l.unit_cost, l.serial_number,
      ac.condition, ac.predefined AS condition_predefined,
      d.text AS depot_text, i.uuid AS inventory_uuid,
      i.code AS inventory_code, i.text AS inventory_text,
      i.manufacturer_brand, i.manufacturer_model,
      BUID(ig.uuid) AS group_uuid, ig.name AS group_name,
      u.display_name AS scanned_by_name, e.display_name AS assigned_to_name
    FROM asset_scan AS s
    JOIN lot l ON l.uuid = s.asset_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid AND i.is_asset = 1
    JOIN inventory_group ig ON ig.uuid = i.group_uuid
    JOIN depot d ON d.uuid = s.depot_uuid
    JOIN asset_condition ac ON ac.id = s.condition_id
    JOIN user AS u ON u.id = s.scanned_by
    LEFT JOIN stock_assign sa ON sa.lot_uuid = l.uuid AND sa.is_active = 1
    LEFT JOIN entity e ON e.uuid = sa.entity_uuid
  `;
  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return db.exec(query, queryParameters);
}

/**
 * @function createAssetScan
 *
 * POST /asset/scan'
 */
exports.createAssetScan = async function createAssetScan(req, res, next) {

  // Limit fields for creating new asset scan
  const allowedInCreate = ['depot_uuid', 'asset_uuid', 'location_uuid', 'scanned_by', 'condition_id', 'notes'];
  const params = _.pick(req.body, allowedInCreate);
  const newUuid = util.uuid();
  params.uuid = newUuid;
  params.scanned_by = params.scanned_by || req.session.user.id;

  const sql = 'INSERT INTO asset_scan SET ?;';

  db.exec(sql, [binarize(params)])
    .then(() => res.status(201).json({ uuid : newUuid }))
    .catch(next)
    .done();
};

/**
 * @function updateAssetScan
 *
 * PUT /asset/scan'
 */
exports.updateAssetScan = async function updateAssetScan(req, res, next) {
  const uuid = db.bid(req.params.uuid);

  // Limit which fields can be updated
  const allowedInUpdate = ['depot_uuid', 'location_uuid', 'scanned_by', 'condition_id', 'notes'];
  const params = _.pick(binarize(req.body), allowedInUpdate);

  // Force an update to 'updated_at'.  Using SQL 'ON UPDATE TIMESTAMP' does not seem to work
  params.updated_at = new Date();

  const sql = 'UPDATE asset_scan SET ? WHERE uuid = ?;';
  db.exec(sql, [params, uuid])
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

/**
 * @function deleteAssetScan
 *
 * DELETE /asset/scan'
 */
exports.deleteAssetScan = async function deleteAssetScan(req, res, next) {
  const uuid = db.bid(req.params.uuid);
  const sql = 'DELETE FROM asset_scan WHERE uuid = ?;';
  db.one(sql, [uuid])
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};
