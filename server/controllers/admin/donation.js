const db = require('../../lib/db');

module.exports = {
  create,
  update,
  read,
  remove,
  detail,
};

function create(req, res, next) {
  const data = req.body;
  data.uuid = data.uuid ? db.bid(data.uuid) : db.uuid();

  db.exec(`INSERT INTO donation SET ?`, data).then(() => {
    res.sendStatus(201);
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
  const sql = `
    SELECT BUID(dt.uuid) as uuid, dt.reference, dt.project_id,
      dt.description,
      dt.date,
      dt.donor_id, d.display_name, p.name as project_name
    FROM donation dt
    JOIN project p ON p.id= dt.project_id
    JOIN donor d ON d.id= dt.donor_id
    `;

  db.exec(sql).then(donations => {
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
