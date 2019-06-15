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
  const indicatorSql = `UPDATE indicator SET ? WHERE uuid = ?`;
  const hospitalizationSql = `UPDATE hospitalization_indicator SET ? WHERE indicator_uuid = ?`;

  transaction.addQuery(indicatorSql, [indicator, _uuid]);
  transaction.addQuery(hospitalizationSql, [hospitalization, _uuid]);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


function remove(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const indicatorSql = `
    DELETE FROM indicator
    WHERE uuid = ?
  `;
  const hospitalizationSql = `DELETE FROM hospitalization_indicator WHERE indicator_uuid = ?`;

  const transaction = db.transaction();
  transaction.addQuery(hospitalizationSql, _uuid);
  transaction.addQuery(indicatorSql, _uuid);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


async function detail(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const query = `
    SELECT 
      BUID(i.uuid) as uuid, i.status_id, i.period_id, i.user_id, i.type_id, i.service_id,
      hi.total_day_realized, hi.total_beds, hi.total_external_patient,
      hi.total_hospitalized_patient, hi.total_death, s.name as service_name,
      p.fiscal_year_id
    FROM indicator i
    JOIN service s ON s.id = i.service_id
    JOIN period p ON p.id = i.period_id
    JOIN hospitalization_indicator hi ON hi.indicator_uuid = i.uuid
    WHERE i.uuid = ?
  `;

  try {

    const rows = await db.one(query, _uuid);
    res.status(200).json(rows);

  } catch (error) {
    next(error);
  }

}
