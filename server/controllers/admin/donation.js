const db = require('../../lib/db');
const util = require('../../lib/util');
const FilterParser = require('../../lib/filter');
const { flux } = require('../stock/core');

module.exports = {
  create,
  update,
  read,
  remove,
  detail,
  stockBalance : donationBalance,
};

function create(req, res, next) {
  const { donation, items } = req.body;
  const uuidString = donation.uuid || util.uuid();
  donation.uuid = db.bid(uuidString);
  donation.date = new Date(donation.date);
  const transaction = db.transaction();

  transaction.addQuery(`INSERT INTO donation SET ?`, donation);

  items.forEach(item => {
    item.uuid = db.uuid();
    item.donation_uuid = donation.uuid;
    item.inventory_uuid = db.bid(item.inventory_uuid);
    transaction.addQuery(`INSERT INTO donation_item SET ?`, item);
  });

  transaction.addQuery(`
    INSERT INTO document_map
    SELECT do.uuid, CONCAT_WS('.', 'DO', project.abbr, do.reference)
    FROM donation do 
    JOIN project where project.id = do.project_id AND do.uuid=?
  `, donation.uuid);

  transaction.execute().then(() => {
    res.status(201).json({ uuid : uuidString });
  }).catch(next);

}

function update(req, res, next) {
  const data = req.body;
  const { uuid } = req.params;
  db.exec(`UPDATE donation SET ? WHERE uuid=?`, [data, db.bid(uuid)]).then(() => {
    res.sendStatus(200);
  }).catch(next);
}

function read(req, res, next) {
  const data = db.convert(req.query, ['uuid']);
  const filters = new FilterParser(data, { tableAlias : 'dt' });

  const sql = `
    SELECT BUID(dt.uuid) as uuid, dt.project_id, dm.text as reference,
      dt.description,
      dt.date,
      dt.donor_id, d.display_name, p.name as project_name
    FROM donation dt
    JOIN project p ON p.id= dt.project_id
    JOIN donor d ON d.id= dt.donor_id
    JOIN document_map dm ON dm.uuid = dt.uuid
    `;

  filters.equals('uuid');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters).then(donations => {
    res.status(200).json(donations);
  }).catch(next);
}

function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, reference, project_id, description, date, donor_id 
    FROM donation
    WHERE uuid=?`;
  const { uuid } = req.params;
  db.one(sql, db.bid(uuid)).then(donation => {
    res.status(200).json(donation);
  }).catch(next);
}

/**
 * GET /donations/:uuid/stock_balance
 *
 * @description
 * This method return the balance of a purchase to know
 * the amount and inventories which are already entered.
 */
function donationBalance(req, res, next) {
  const FROM_DONATION_ID = flux.FROM_DONATION;
  const donationUuid = db.bid(req.params.uuid);
  const sql = `
    SELECT x.* FROM (
      SELECT dt.uuid  as uuid, dt.project_id, dm.text as reference,
        dt.description, BUID(dti.inventory_uuid) AS inventory_uuid,
        dti.quantity, dti.unit_price, dt.date,
        dt.donor_id, d.display_name, p.name as project_name,
        IFNULL(distributed.quantity, 0) AS distributed_quantity,
        (dti.quantity - IFNULL(distributed.quantity, 0)) AS balance
      FROM donation dt
      JOIN project p ON p.id= dt.project_id
      JOIN donor d ON d.id= dt.donor_id
      JOIN donation_item dti ON dti.donation_uuid = dt.uuid
      JOIN document_map dm ON dm.uuid = dt.uuid
      LEFT JOIN
      (
        SELECT l.label, SUM(IFNULL(m.quantity, 0)) AS quantity, l.inventory_uuid, l.origin_uuid
        FROM stock_movement m
          JOIN lot l ON l.uuid = m.lot_uuid
          JOIN inventory i ON i.uuid = l.inventory_uuid
        WHERE m.flux_id = ? AND m.is_exit = 0 AND l.origin_uuid = ?
        GROUP BY l.origin_uuid, l.inventory_uuid
      ) AS distributed
        ON distributed.inventory_uuid = dti.inventory_uuid
        AND distributed.origin_uuid = dt.uuid
  ) AS x
      WHERE  x.uuid=? HAVING x.balance > 0 AND x.balance <= x.quantity
  `;

  db.exec(sql, [FROM_DONATION_ID, donationUuid, donationUuid])
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function remove(req, res, next) {
  const { uuid } = req.params;
  db.exec(`DELETE FROM donation WHERE uuid=?`, db.bid(uuid)).then(() => {
    res.sendStatus(200);
  }).catch(next);
}
