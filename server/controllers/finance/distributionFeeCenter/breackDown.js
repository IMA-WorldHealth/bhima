/**
* Distribution Fee Center Controller
*
* This function allows you to make the distributions of
* one or more transactions at the same time while specifying the percentage distribution rate
*/

const q = require('q');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const FilterParser = require('../../../lib/filter');
const referenceAccount = require('./referenceAccount');
const generalLedger = require('../generalLedger');


function breackDown(req, res, next) {
  const { data } = req.body;
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
          data.is_cost,
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
    trans_uuid, 
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
    .then((results) => {
      res.status(201).json({ id : results[0].insertId });
    })
    .catch(next)
    .done();

}

exports.breackDown = breackDown;
