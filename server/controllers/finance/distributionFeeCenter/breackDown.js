/**
  *Distribution Fee Center Controller
  *This function allows you to make the distributions of
  *one or more transactions at the same time while specifying the percentage distribution rate
*/
const db = require('../../../lib/db');

function breackDown(req, res, next) {
  const { data } = req.body;
  const isCost = data.is_cost;
  const dataValues = data.values;

  const dataToDistribute = [];
  const userId = req.session.user.id;

  data.transactions.forEach((transaction) => {
    Object.keys(dataValues).forEach((principalCenterId) => {
      const percentageValue = dataValues[principalCenterId];

      if (percentageValue) {
        const debitValuePercent = transaction.debit_equiv * (percentageValue / 100);
        const creditValuePercent = transaction.credit_equiv * (percentageValue / 100);

        dataToDistribute.push([
          db.bid(transaction.uuid),
          transaction.trans_id,
          transaction.account_id,
          isCost,
          transaction.fee_center_id,
          principalCenterId,
          debitValuePercent,
          creditValuePercent,
          transaction.currency_id,
          new Date(),
          userId,
        ]);
      }
    });
  });

  const sql = `INSERT INTO fee_center_distribution (
    row_uuid, 
    trans_id, 
    account_id,
    is_cost,
    auxiliary_fee_center_id,
    principal_fee_center_id,
    debit_equiv, 
    credit_equiv, 
    currency_id, 
    date_distribution, user_id) VALUES ?`;

  const transaction = db.transaction();

  if (dataToDistribute.length) {
    transaction
      .addQuery(sql, [dataToDistribute]);
  }

  transaction.execute()
    .then(() => {
      res.sendStatus(201);
    })
    .catch(next)
    .done();

}

exports.breackDown = breackDown;
