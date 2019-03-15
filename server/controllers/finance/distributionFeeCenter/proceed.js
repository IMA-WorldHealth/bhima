/**
* Distribution Fee Center Controller
*
* This function makes it possible to proceed to a basic distribution
* of a profit or a cost, of an auxiliary center towards the main centers
*/
const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');

function proceed(req, res, next) {
  const { data } = req.body;

  const isDebtor = data.debit_equiv > 0;
  const dataValues = data.values;
  const auxiliaryCenterId = data.fee_center_id || data.auxiliary_fee_center_id;
  const dataToDistribute = [];

  data.user_id = req.session.user.id;
  data.uuid = data.row_uuid || data.uuid;

  Object.keys(dataValues).forEach((principalCenterId) => {
    const debitEquivDistributed = isDebtor ? dataValues[principalCenterId] : 0;
    const creditEquivDistributed = isDebtor ? 0 : dataValues[principalCenterId];
    if (debitEquivDistributed > 0 || creditEquivDistributed > 0) {
      dataToDistribute.push([
        db.bid(data.uuid),
        data.trans_id,
        data.account_id,
        data.is_variable,
        data.is_turnover,
        data.is_cost,
        auxiliaryCenterId,
        principalCenterId,
        debitEquivDistributed,
        creditEquivDistributed,
        new Date(),
        data.user_id,
      ]);
    }
  });

  const delFeeCenterDistribution = `DELETE FROM fee_center_distribution WHERE row_uuid = ?`;

  const sql = `INSERT INTO fee_center_distribution (
    row_uuid,
    trans_id,
    account_id,
    is_variable,
    is_turnover,
    is_cost,
    auxiliary_fee_center_id,
    principal_fee_center_id,
    debit_equiv,
    credit_equiv,
    date_distribution, user_id) VALUES ?`;

  const transaction = db.transaction();

  if (dataToDistribute.length) {
    transaction
      .addQuery(delFeeCenterDistribution, [db.bid(data.uuid)])
      .addQuery(sql, [dataToDistribute]);
  } else {
    throw new BadRequest('ERRORS.ER_EMPTY_QUERY');
  }

  transaction.execute()
    .then((results) => {
      res.status(201).json({ id : results[1].insertId });
    })
    .catch(next)
    .done();

}

exports.proceed = proceed;
