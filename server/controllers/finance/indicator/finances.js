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
  const financesSql = `INSERT INTO finances_indicator SET ?`;

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
  const financesSql = `UPDATE finances_indicator SET ? WHERE uuid=?`;

  transaction.addQuery(indicatorSql, [indicator, finances.indicator_uuid]);
  transaction.addQuery(financesSql, [finances, _uuid]);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
}


function remove(req, res, next) {
  const _uuid = db.bid(req.params.uuid);

  const indicatorSql = `
    DELETE FROM indicator
    WHERE uuid IN (SELECT indicator_uuid FROM finances_indicator WHERE uuid=?)
  `;
  const financesSql = `DELETE FROM finances_indicator WHERE uuid=?`;

  const transaction = db.transaction();
  transaction.addQuery(financesSql, _uuid);
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
    WHERE uuid IN (SELECT indicator_uuid FROM finances_indicator WHERE uuid=?)
  `;
  const financesSql = `
    SELECT BUID(uuid) as uuid, BUID(indicator_uuid), totalReceiptAmount,
      subsidyAmount, medicationSaleAmount, totalExpenseAmount,
      variousChargesAmount, purchaseMedicationAmount, personalChargeAmount,
      totalOperatingExpenditureAmount, totalDepreciationAmount, totalDebtAmount,
      totalCashAmount, totalStockValueAmount, personelNumber
    FROM finances_indicator
    WHERE uuid=?`;

  try {
    const indicator = await db.one(indicatorSql, _uuid);
    const finances = await db.one(financesSql, _uuid);

    res.status(200).json({ indicator, finances });

  } catch (error) {
    next(error);
  }
}
