/**
* Distribution Fee Center Get Distribution Keys.
*
* This function makes it possible to obtain the distribution keys of each auxiliary
* center towards the main centers while reviewing the auxiliary centers which do not yet have distribution keys.
*/
const db = require('../../../lib/db');

function getDistributionKey(req, res, next) {
  const sql = `
    SELECT k.auxiliary_fee_center_id, fca.label AS auxiliary_label, k.principal_fee_center_id,
    fcp.label AS principal_label, k.rate, k.user_id, u.display_name AS user_name
    FROM distribution_key as k
    JOIN fee_center AS fca ON fca.id = k.auxiliary_fee_center_id
    JOIN fee_center AS fcp ON fcp.id = k.principal_fee_center_id
    JOIN user AS u ON u.id = k.user_id
    UNION
    SELECT f.id AS auxiliary_fee_center_id, f.label AS auxiliary_label, '---' AS principal_fee_center_id,
    '---' AS principal_label, 0 AS rate, '---' AS user_id, '---' AS user_name
    FROM fee_center AS f
    WHERE f.is_principal = 0 AND f.id NOT IN (SELECT k.auxiliary_fee_center_id FROM distribution_key AS k)
  `;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next);
}

function allDistributionKey() {
  const sql = `
    SELECT k.id, k.auxiliary_fee_center_id, k.principal_fee_center_id, k.rate
    FROM distribution_key AS k
  `;

  return db.exec(sql);
}

exports.getDistributionKey = getDistributionKey;
exports.allDistributionKey = allDistributionKey;
