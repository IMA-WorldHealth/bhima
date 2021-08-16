/**
* Distribution Fee Center Controller
*
* This function is used to set the various distribution keys of the auxiliary cost centers to the main cost center.
*/

const db = require('../../../lib/db');

function setting(req, res, next) {
  const { data } = req.body;

  const dataValues = data.values;

  data.user_id = req.session.user.id;

  const distributionKey = [];

  Object.entries(dataValues)
    .forEach(([principalCenterId, rateDistribution]) => {
      if (rateDistribution) {
        distributionKey.push([
          data.auxiliary_fee_center_id,
          principalCenterId,
          rateDistribution,
          data.user_id,
        ]);
      }
    });

  const delDistribution = `DELETE FROM distribution_key WHERE auxiliary_fee_center_id = ?`;

  const sql = `
    INSERT INTO distribution_key (
    auxiliary_fee_center_id,
    principal_fee_center_id,
    rate,
    user_id) VALUES ?`;

  const transaction = db.transaction();

  if (distributionKey.length) {
    transaction
      .addQuery(delDistribution, data.auxiliary_fee_center_id)
      .addQuery(sql, [distributionKey]);
  }

  transaction.execute()
    .then((results) => {
      res.status(201).json({ id : results[1].insertId });
    })
    .catch(next)
    .done();
}

function resetKey(req, res, next) {
  const { data } = req.body;

  const delDistribution = `DELETE FROM distribution_key WHERE auxiliary_fee_center_id = ?`;

  db.exec(delDistribution, [data])
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

exports.setting = setting;
exports.resetKey = resetKey;
