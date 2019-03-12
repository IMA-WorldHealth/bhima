const db = require('../../../lib/db');
const { uuid } = require('../../../lib/util');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.detail = detail;

function create(req, res, next) {
  const { indicator, hospitalization } = req.body;

  indicator.uuid = indicator.uuid ? db.bid(indicator.uuid) : db.bid(uuid());
  indicator.user_id = req.session.user.id;

  hospitalization.uuid = hospitalization.uuid ? db.bid(hospitalization.uuid) : db.bid(uuid());
  hospitalization.indicator_uuid = indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `INSERT INTO indicator SET ?`;
  const hospitalizationSql = `INSERT INTO hospitalization_indicator SET ?`;

  transaction.addQuery(indicatorSql, indicator);
  transaction.addQuery(hospitalizationSql, hospitalization);

  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}


function update(req, res, next) {
  const { indicator, hospitalization } = req.body;
  db.convert(hospitalization, ['indicator_uuid']);
  const _uuid = db.bid(req.params.uuid);
  delete hospitalization.uuid;
  delete indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `UPDATE indicator SET ? WHERE uuid=?`;
  const hospitalizationSql = `UPDATE hospitalization_indicator SET ? WHERE uuid=?`;

  transaction.addQuery(indicatorSql, [indicator, hospitalization.indicator_uuid]);
  transaction.addQuery(hospitalizationSql, [hospitalization, _uuid]);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


function remove(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const indicatorSql = `
    DELETE FROM indicator
    WHERE uuid IN (SELECT indicator_uuid FROM hospitalization_indicator WHERE uuid=?)
  `;
  const hospitalizationSql = `DELETE FROM hospitalization_indicator WHERE uuid=?`;

  const transaction = db.transaction();
  transaction.addQuery(hospitalizationSql, _uuid);
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
    WHERE uuid IN (SELECT indicator_uuid FROM hospitalization_indicator WHERE uuid=?)
  `;
  const hospitalizationSql = `
    SELECT BUID(uuid) as uuid, BUID(indicator_uuid), service_id, day_realized, bed_number,
      daysOfHospitalization, hospitalizedPatients, hospitalizedPatientPerDay, PatientsDied
    FROM hospitalization_indicator
    WHERE uuid=?`;

  try {
    const indicator = await db.one(indicatorSql, _uuid);
    const hospitalization = await db.one(hospitalizationSql, _uuid);

    res.status(200).json({ indicator, hospitalization });

  } catch (error) {
    next(error);
  }

}
