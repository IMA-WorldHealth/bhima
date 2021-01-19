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

exports.update = update;
exports.details = details;
exports.assignments = assignments;
exports.getLotTags = getLotTags;
exports.dupes = dupes;

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
  const query = `
    SELECT
      BUID(l.uuid) AS uuid, l.label, l.quantity, l.unit_cost,
      l.description, l.expiration_date,
      BUID(i.uuid) AS inventory_uuid, i.text
    FROM lot l
    JOIN inventory i ON i.uuid = l.inventory_uuid
    WHERE l.uuid = ?;
  `;

  db.one(query, [bid])
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
 * GET /lots/dupes
 *
 * @description
 * Returns all lots with the given label or matching field(s)
 * inventory_uuid, initial_quantity, entry_date, expiration_date
 *
 */
function dupes(req, res, next) {
  console.log("dupes params: ", req.params);
  const lotLabel = req.params.label;
  const inventoryUuid = db.bid(req.params.inventory_uuid);
  const initialQuantity = req.params.initial_quantity;
  const entryDate = req.params.entry_date;
  const expirationDate = req.params.expiration_date;
  const where1 = lotLabel ? `l.label = "${lotLabel}"` : '';
  const where2 = inventoryUuid ? `l.inventory_uuid = ${inventoryUuid}` : '';
  const where3 = initialQuantity ? `l.initial_quantity = ${initialQuantity}` : '';
  const where4 = entryDate ? `l.label = ${entryDate}` : '';
  const where5 = expirationDate ? `l.label = ${expirationDate}` : '';
  const wheres = [where1, where2, where3, where4, where5].join(' AND ');

  const query = `
    SELECT
      BUID(l.uuid) AS uuid, l.label, l.initial_quantity, l.quantity,
      l.unit_cost, l.description, l.entry_date, l.expiration_date,
      BUID(i.uuid) AS inventory_uuid, i.text AS inventory_name
    FROM lot l
    JOIN inventory i ON i.uuid = l.inventory_uuid
    WHERE ${wheres};
  `;

  db.exec(query)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
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
