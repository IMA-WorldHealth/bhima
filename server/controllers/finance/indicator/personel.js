const db = require('../../../lib/db');
const { uuid } = require('../../../lib/util');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.detail = detail;

function create(req, res, next) {
  const { indicator, personel } = req.body;
  indicator.uuid = indicator.uuid ? db.bid(indicator.uuid) : db.bid(uuid());
  indicator.user_id = req.session.user.id;

  personel.uuid = personel.uuid ? db.bid(personel.uuid) : db.bid(uuid());
  personel.indicator_uuid = indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `INSERT INTO indicator SET ?`;
  const personelSql = `INSERT INTO personel_indicator SET ?`;

  transaction.addQuery(indicatorSql, indicator);
  transaction.addQuery(personelSql, personel);

  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}


function update(req, res, next) {
  const { indicator, personel } = req.body;
  db.convert(personel, ['indicator_uuid']);
  const _uuid = db.bid(req.params.uuid);
  delete personel.uuid;
  delete indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `UPDATE indicator SET ? WHERE uuid=?`;
  const personelSql = `UPDATE personel_indicator SET ? WHERE uuid=?`;

  transaction.addQuery(indicatorSql, [indicator, personel.indicator_uuid]);
  transaction.addQuery(personelSql, [personel, _uuid]);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


function remove(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const indicatorSql = `
    DELETE FROM indicator
    WHERE uuid IN (SELECT indicator_uuid FROM personel_indicator WHERE uuid=?)
  `;
  const personelSql = `DELETE FROM personel_indicator WHERE uuid=?`;

  const transaction = db.transaction();
  transaction.addQuery(personelSql, _uuid);
  transaction.addQuery(indicatorSql, _uuid);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


async function detail(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const indicatorSql = `
    SELECT BUID(uuid) as uuid, status_id, period_id, user_id, type
    FROM indicator
    WHERE uuid IN (SELECT indicator_uuid FROM personel_indicator WHERE uuid=?)
  `;
  const personelSql = `
    SELECT BUID(uuid) as uuid,  BUID(indicator_uuid), bed_number, doctorsNumber, nurseNumber,
      caregiversNumber, totalStaff, externalConsultationNumber,
      consultationNumber, surgeryByDoctor, day_realized,
      hospitalizedPatients
    FROM personel_indicator
    WHERE uuid=?`;

  try {
    const indicator = await db.one(indicatorSql, _uuid);
    const personel = await db.one(personelSql, _uuid);

    res.status(200).json({ indicator, personel });

  } catch (error) {
    next(error);
  }

}
