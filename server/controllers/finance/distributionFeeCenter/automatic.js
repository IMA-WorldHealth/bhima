/**
* Distribution Fee Center Automatic Controller
*
* This function allows automatic distribution of invoices whose services are linked to Principal fee centers
*/
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');

function automatic(req, res, next) {
  const { data } = req.body;
  const transUuids = data.map(item => db.bid(item.uuid));

  const sql = `
    SELECT BUID(gl.uuid) AS row_uuid, gl.trans_id, gl.debit_equiv, gl.credit_equiv,
    gl.account_id, gl.record_uuid, sfc.fee_center_id, iv.description, iv.service_id, s.name AS serviceName
    FROM general_ledger AS gl
    JOIN invoice AS iv ON iv.uuid = gl.record_uuid
    JOIN service AS s ON s.id = iv.service_id
    JOIN service_fee_center AS sfc ON sfc.service_id = s.id
    WHERE gl.uuid IN (?)
  `;

  db.exec(sql, [transUuids])
    .then((rows) => {
      const dataToDistribute = [];
      const userId = req.session.user.id;

      rows.forEach((row) => {
        data.forEach((item) => {
          item.is_cost = item.is_cost || 0;

          if (row.row_uuid === item.uuid) {
            dataToDistribute.push([
              db.bid(row.row_uuid),
              row.trans_id,
              item.account_id,
              item.is_cost,
              item.fee_center_id,
              row.fee_center_id,
              row.debit_equiv,
              row.credit_equiv,
              new Date(),
              userId,
            ]);
          }
        });
      });


      if (!dataToDistribute.length) {
        throw new NotFound(`Could not find any service linked to fee Centers`);
      }

      const sqlFeeCenterDistribution = `INSERT INTO fee_center_distribution (
        row_uuid, 
        trans_id,
        account_id,
        is_cost,
        auxiliary_fee_center_id,
        principal_fee_center_id,
        debit_equiv, 
        credit_equiv,
        date_distribution, user_id) VALUES ?`;

      return db.exec(sqlFeeCenterDistribution, [dataToDistribute]);
    })
    .then((results) => {
      res.status(201).json({ id : results.insertId });
    })
    .catch(next)
    .done();
}

exports.automatic = automatic;
