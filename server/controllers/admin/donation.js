const db = require('../../lib/db');
const util = require('../../lib/util');
const FilterParser = require('../../lib/filter');

module.exports = {
  create,
  update,
  read,
  remove,
  detail,
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
    SELECT BUID(dt.uuid) as uuid, dt.reference, dt.project_id,
      dt.description,
      dt.date,
      dt.donor_id, d.display_name, p.name as project_name
    FROM donation dt
    JOIN project p ON p.id= dt.project_id
    JOIN donor d ON d.id= dt.donor_id
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

function remove(req, res, next) {
  const { uuid } = req.params;
  db.exec(`DELETE FROM donation WHERE uuid=?`, db.bid(uuid)).then(() => {
    res.sendStatus(200);
  }).catch(next);
}
