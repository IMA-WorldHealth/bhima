
/**
 * @module lots/
 *
 *
 * @description
 * The /lots HTTP API endpoint
 *
 * @requires lodash
 * @requires lib/db
 */
const _ = require('lodash');
const db = require('../../lib/db');

exports.update = update;
exports.details = details;

/**
 * GET /stock/lots/:uuid
 * Get details of a lots
 */
function details(req, res, next) {
  const bid = db.bid(req.params.uuid);
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
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

/**
 * PUT /stock/lots/:uuid
 * Edit a stock lot
 */
function update(req, res, next) {
  const bid = db.bid(req.params.uuid);
  const allowedToEdit = ['label', 'expiration_date'];
  const params = _.pick(req.body, allowedToEdit);
  db.exec('UPDATE lot SET ? WHERE uuid = ?', [params, bid])
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next)
    .done();
}
