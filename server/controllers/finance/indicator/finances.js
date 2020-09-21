const db = require('../../../lib/db');
const { uuid } = require('../../../lib/util');

module.exports.create = create;
module.exports.update = update;
module.exports.delete = remove;
module.exports.detail = detail;

function create(req, res, next) {
  const { indicator, finances } = req.body;
  indicator.uuid = indicator.uuid ? db.bid(indicator.uuid) : db.bid(uuid());
  indicator.user_id = req.session.user.id;

  finances.uuid = finances.uuid ? db.bid(finances.uuid) : db.bid(uuid());
  finances.indicator_uuid = indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `INSERT INTO indicator SET ?`;
  const financesSql = `INSERT INTO finance_indicator SET ?`;

  transaction.addQuery(indicatorSql, indicator);
  transaction.addQuery(financesSql, finances);

  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}

function update(req, res, next) {
  const { indicator, finances } = req.body;
  db.convert(finances, ['indicator_uuid']);
  const _uuid = db.bid(req.params.uuid);
  delete finances.uuid;
  delete indicator.uuid;

  const transaction = db.transaction();
  const indicatorSql = `UPDATE indicator SET ? WHERE uuid=?`;
  const financesSql = `UPDATE finance_indicator SET ? WHERE indicator_uuid=?`;

  transaction.addQuery(indicatorSql, [indicator, _uuid]);
  transaction.addQuery(financesSql, [finances, _uuid]);

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
  const financesSql = `DELETE FROM finance_indicator WHERE indicator_uuid=?`;

  const transaction = db.transaction();
  transaction.addQuery(financesSql, _uuid);
  transaction.addQuery(indicatorSql, _uuid);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}

async function detail(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const query = `
    SELECT
      BUID(i.uuid) as uuid, i.status_id, i.period_id, i.user_id, i.type_id,
      hi.total_revenue, hi.total_subsidies,
      hi.total_drugs_sale, hi.total_expenses, hi.total_other_charge, total_drugs_purchased,
      hi.total_staff_charge, hi.total_operating_charge, hi.total_depreciation, hi.total_debts,
      hi.total_cash, hi.total_stock_value, hi.total_staff,
      p.fiscal_year_id
    FROM indicator i
    JOIN period p ON p.id = i.period_id
    JOIN finance_indicator hi ON hi.indicator_uuid = i.uuid
    WHERE i.uuid = ?
  `;

  try {
    const rows = await db.one(query, _uuid);
    res.status(200).json(rows);

  } catch (error) {
    next(error);
  }
}
