/**
 * Stock Assign Controller
 */
const db = require('../../lib/db');
const util = require('../../lib/util');
const FilterParser = require('../../lib/filter');

exports.detail = (req, res, next) => {
  const uuid = db.bid(req.params.uuid);
  const sqlDetail = `
    SELECT 
      BUID(sa.uuid) AS uuid, BUID(sa.lot_uuid) AS lot_uuid,
      BUID(sa.depot_uuid) AS depot_uuid, BUID(sa.entity_uuid) AS entity_uuid,
      sa.quantity, sa.created_at, sa.description, sa.is_active
    FROM stock_assign sa
    WHERE sa.uuid = ?;
  `;
  db.one(sqlDetail, [uuid])
    .then(detail => res.status(200).json(detail))
    .catch(next)
    .done();
};

exports.list = (req, res, next) => {
  const params = binarize(req.query);

  // get the built query of stock assignment its parameters
  const sa = getStockAssignment(params);
  db.exec(sa.query, sa.queryParameters)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
};

exports.create = (req, res, next) => {
  const identifier = util.uuid();
  req.body.uuid = identifier;
  req.body.user_id = req.session.user.id;
  const params = binarize(req.body);
  const sql = 'INSERT INTO stock_assign SET ?;';
  db.exec(sql, [params])
    .then(() => {
      const update = 'UPDATE lot SET is_assigned = 1 WHERE uuid = ?;';
      return db.exec(update, [params.lot_uuid]);
    })
    .then(() => res.status(201).json({ uuid : identifier }))
    .catch(next)
    .done();
};

/**
 * TODO: This feature need to be implemented on the client side
 * in a good way.
 * Since implementing this feature can be a source of lack of information
 * we do not implemented it for now.
 * Stock assignment can just be created (assignment) or unassignment
 */
exports.update = (req, res, next) => {
  const params = binarize(req.body);
  const uuid = db.bid(req.params.uuid);

  if (params.uuid) {
    delete params.uuid;
  }

  const fetchOriginalAssignment = `
    SELECT lot_uuid FROM stock_assign WHERE uuid = ?;
  `;
  db.one(fetchOriginalAssignment, [uuid])
    .then(previousAssignment => {
      const transaction = db.transaction();
      transaction.addQuery('UPDATE stock_assign SET ? WHERE uuid = ?;', [params, uuid]);
      transaction.addQuery('UPDATE lot SET is_assigned = 1 WHERE uuid = ?;', [uuid]);
      transaction.addQuery('UPDATE lot SET is_assigned = 0 WHERE uuid = ?;', [previousAssignment.uuid]);
      return transaction.execute();
    })
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

/**
 * removeAssign() allow to unassign stock to en entity, which is different to just
 * delete assignment, the deletion may be a source of lack of information
 * for tracking historic of lot assignment
 */
exports.removeAssign = (req, res, next) => {
  const uuid = db.bid(req.params.uuid);
  const sqlAssignedLot = 'SELECT lot_uuid FROM stock_assign WHERE uuid = ?';
  const sqlRemoveAssign = 'UPDATE stock_assign SET is_active = 0 WHERE uuid = ?;';
  const sqlUpdateLot = 'UPDATE lot SET is_assigned = 0 WHERE uuid = ?;';
  db.one(sqlAssignedLot, [uuid])
    .then(assignment => {
      const transaction = db.transaction();
      transaction.addQuery(sqlRemoveAssign, [uuid]);
      transaction.addQuery(sqlUpdateLot, [assignment.lot_uuid]);
      return transaction.execute();
    })
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

/**
 * deleteAssign() allow to delete the assign record in the database
 */
exports.deleteAssign = (req, res, next) => {
  const uuid = db.bid(req.params.uuid);
  const sqlAssignedLot = 'SELECT lot_uuid FROM stock_assign WHERE uuid = ?';
  const sqlDeleteAssign = 'DELETE FROM stock_assign WHERE uuid = ?;';
  const sqlUpdateLot = 'UPDATE lot SET is_assigned = 0 WHERE uuid = ?;';
  db.one(sqlAssignedLot, [uuid])
    .then(assignment => {
      const transaction = db.transaction();
      transaction.addQuery(sqlDeleteAssign, [uuid]);
      transaction.addQuery(sqlUpdateLot, [assignment.lot_uuid]);
      return transaction.execute();
    })
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

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
    'depot_uuid',
    'lot_uuid',
    'inventory_uuid',
    'entity_uuid',
  ]);
}

/**
 * @function getStockAssignment
 *
 * @description
 * build the query for getting stock assignment based on
 * a given parameters
 *
 * @param {object} params
 * @returns {object} { query:..., queryParameters:... }
 */
function getStockAssignment(params) {
  const sql = `
    SELECT 
      BUID(sa.uuid) AS uuid, sa.description, sa.created_at, sa.quantity,
      BUID(l.uuid) AS lot_uuid, l.label,
      BUID(i.uuid) AS inventory_uuid, i.text, i.code,
      BUID(e.uuid) AS entity_uuid, e.display_name,
      BUID(d.uuid) AS depot_uuid, d.text AS depot_text
    FROM stock_assign sa
    JOIN lot l ON l.uuid = sa.lot_uuid AND sa.is_active = 1
    JOIN entity e ON e.uuid = sa.entity_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN depot d ON d.uuid = sa.depot_uuid 
  `;

  const filters = new FilterParser(params);
  filters.equals('uuid', 'uuid', 'l');
  filters.equals('depot_text', 'text', 'd');
  filters.equals('depot_uuid', 'depot_uuid', 'sa');
  filters.equals('entity_uuid', 'entity_uuid', 'sa');
  filters.equals('inventory_uuid', 'uuid', 'i');
  filters.equals('text', 'text', 'i');
  filters.equals('label', 'label', 'l');
  filters.period('period', 'created_at', 'sa');
  filters.dateFrom('custom_period_start', 'created_at', 'sa');
  filters.dateTo('custom_period_end', 'created_at', 'sa');

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return { query, queryParameters };
}
