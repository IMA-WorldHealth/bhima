/**
 * @module lots/
 *
 *
 * @description
 * The /lots HTTP API endpoint
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/filter
 */
const _ = require('lodash');
const moment = require('moment');
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');

const detailsQuery = `
  SELECT
    BUID(l.uuid) AS uuid, l.label, l.quantity, l.initial_quantity,
    l.unit_cost, l.description, l.entry_date, l.expiration_date,
    BUID(i.uuid) AS inventory_uuid, i.text as inventory_text,
    i.code as inventory_code
  FROM lot l
  JOIN inventory i ON i.uuid = l.inventory_uuid
  `;

exports.update = update;
exports.details = details;
exports.assignments = assignments;
exports.getLotTags = getLotTags;
exports.getCandidates = getCandidates;
exports.getDupes = getDupes;
exports.merge = merge;

function getLotTags(bid) {
  const queryTags = `
    SELECT BUID(t.uuid) uuid, t.name, t.color
    FROM tags t
    JOIN lot_tag lt ON lt.tag_uuid = t.uuid
    WHERE lt.lot_uuid = ?
  `;
  return db.exec(queryTags, [bid]);
}

/**
 * GET /stock/lots/:uuid
 * Get details of a lot
 */
function details(req, res, next) {
  const bid = db.bid(req.params.uuid);
  let info = {};
  db.one(`${detailsQuery} WHERE l.uuid = ?`, [bid])
    .then(row => {
      info = row;
      return getLotTags(bid);
    })
    .then(tags => {
      info.tags = tags;
      res.status(200).json(info);
    })
    .catch(next)
    .done();
}

/**
 * PUT /stock/lots/:uuid
 * Edit a stock lot
 */
async function update(req, res, next) {
  const bid = db.bid(req.params.uuid);
  const allowedToEdit = ['label', 'expiration_date', 'unit_cost'];
  const params = _.pick(req.body, allowedToEdit);
  const { tags } = req.body;

  if (params.expiration_date) {
    params.expiration_date = moment(params.expiration_date).format('YYYY-MM-DD');
  }

  try {
    await db.exec('UPDATE lot SET ? WHERE uuid = ?', [params, bid]);

    if (tags) {
      // update tags
      const transaction = db.transaction();
      transaction.addQuery('DELETE FROM lot_tag WHERE lot_uuid = ?', [bid]);
      tags.forEach(t => {
        const binaryTagUuid = db.bid(t.uuid);
        transaction.addQuery('INSERT INTO lot_tag(lot_uuid, tag_uuid) VALUES (?, ?);', [bid, binaryTagUuid]);
      });
      await transaction.execute();
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /inventory/:uuid/lot_candidates
 *
 * @description
 * Returns all lots with the that inventory uuid
 */
function getCandidates(req, res, next) {
  const inventoryUuid = db.bid(req.params.uuid);

  const query = `
    SELECT BUID(l.uuid) AS uuid, l.label, l.description, l.expiration_date
    FROM lot l
    WHERE l.inventory_uuid = ?
    ORDER BY label, expiration_date
    `;

  return db.exec(query, [inventoryUuid])
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /lots_dupes/:label?/:inventory_uuid?/:initial_quantity?/:entry_date?/:expiration_date?
 *
 * @description
 * Returns all lots with the given label or matching field(s)
 * inventory_uuid, initial_quantity, entry_date, expiration_date
 *
 * TODO: After getting this working purge unneeded params
 *
 */
function getDupes(req, res, next) {
  const options = db.convert(req.query, ['inventory_uuid']);
  const filters = new FilterParser(options, { tableAlias : 'l' });
  filters.fullText('label');
  filters.equals('inventory_uuid');
  filters.equals('initial_quantity');
  filters.equals('entry_date');
  filters.equals('expiration_date');

  let query = filters.applyQuery(detailsQuery);
  const params = filters.parameters();

  if ('find_dupes' in options) {
    // For the 'find duplicate lots' search, we need a different query
    query = `
      SELECT
        BUID(l.uuid) AS uuid, l.label, l.quantity, l.initial_quantity,
        l.unit_cost, l.description, l.entry_date, l.expiration_date,
        BUID(i.uuid) AS inventory_uuid, i.text as inventory_text,
        i.code as inventory_code, COUNT(*) as num_duplicates
      FROM lot l
      JOIN inventory i ON i.uuid = l.inventory_uuid
      GROUP BY label, inventory_uuid HAVING num_duplicates > 1
      ORDER BY inventory_text, num_duplicates, label
    `;
  }

  return db.exec(query, params)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * GET /lots/:uuid/merge
 *
 * @description
 * Merge the lots_to_merge (in the body) into the lot to keep (given by uuid).
 * This is a accomplished in two steps for each lot to merge:
 *   1. Replace all references to the lot to be merged with
 *      references to the lot to keep.
 *   2. Delete the lot to be merged
 *
 * lot_tag : lot_uuid
 * stock_assign : lot_uuid
 * stock_movement : lot_uuid
 */
async function merge(req, res, next) {
  const uuid = db.bid(req.params.uuid);
  const lotsToMerge = req.body.lotsToMerge.map(db.bid);

  const updateLotTags = 'UPDATE lot_tag SET lot_uuid = ?  WHERE lot_uuid = ?';
  const updateStockAssign = 'UPDATE stock_assign SET lot_uuid = ?  WHERE lot_uuid = ?';
  const updateStockMovement = 'UPDATE stock_movement SET lot_uuid = ?  WHERE lot_uuid = ?';
  const deleteLot = 'DELETE FROM lot WHERE uuid = ?';

  try {
    const transaction = db.transaction();
    lotsToMerge.forEach(rawUuid => {
      const mergeLotUuid = db.bid(rawUuid);
      transaction.addQuery(updateLotTags, [uuid, mergeLotUuid]);
      transaction.addQuery(updateStockAssign, [uuid, mergeLotUuid]);
      transaction.addQuery(updateStockMovement, [uuid, mergeLotUuid]);
      transaction.addQuery(deleteLot, [mergeLotUuid]);
    });
    await transaction.execute();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /lots/:uuid/assignments/:depot_uuid
 *
 * @description
 * Returns all assignments of a lot in a depot to entities ordered by ascending dates
 */
function assignments(req, res, next) {
  const lotUuid = db.bid(req.params.uuid);
  const depotUuid = db.bid(req.params.depot_uuid);

  const query = `
    SELECT e.display_name, sa.created_at, sa.is_active
    FROM stock_assign sa
      JOIN entity e ON e.uuid = sa.entity_uuid
      JOIN lot l ON l.uuid = sa.lot_uuid
      JOIN depot d ON d.uuid = sa.depot_uuid
    WHERE d.uuid = ? AND l.uuid = ?
    ORDER BY sa.created_at ASC;
  `;

  db.exec(query, [depotUuid, lotUuid])
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}
