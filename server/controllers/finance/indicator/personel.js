const db = require('../../../lib/db');
const { uuid } = require('../../../lib/util');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.detail = detail;

function create(req, res, next) {
  const data = req.body;
  data.uuid = db.bid(uuid());
  data.user_id = req.session.user.id;
  const sql = `INSERT INTO personel_indicator SET ?`;
  db.exec(sql, data).then(() => {
    res.sendStatus(201);
  }).catch(next);
}

function update(req, res, next) {
  const data = req.body;
  const _uuid = db.bid(req.params.uuid);
  delete data.uuid;
  const sql = `UPDATE personel_indicator SET ? WHERE uuid=?`;
  db.exec(sql, [data, _uuid]).then(() => {
    res.sendStatus(200);
  }).catch(next);
}

function remove(req, res, next) {
  const _uuid = db.bid(req.params.uuid);
  const sql = `DELETE FROM personel_indicator WHERE uuid=?`;
  db.exec(sql, _uuid).then(() => {
    res.sendStatus(200);
  }).catch(next);
}

function detail(req, res, next) {
  const _uuid = db.bid(req.params.uuid);
  const sql = `
    SELECT BUID(uuid) as uuid, period_id, bed_number, doctorsNumber, nurseNumber,
      caregiversNumber, totalStaff, externalConsultationNumber,
      consultationNumber, surgeryByDoctor, day_realized,
      hospitalizedPatients, status_id
    FROM personel_indicator
    WHERE uuid=?`;
  db.one(sql, _uuid).then(indicator => {
    res.status(200).json(indicator);
  }).catch(next);
}
