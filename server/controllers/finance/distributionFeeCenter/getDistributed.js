/**
* Distribution Fee Center Controller
*
* This function searches all the distributions of the costs and profits made, in order to allow possible updates.
*/
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

function getDistributed(req, res, next) {
  const options = req.query;
  console.log('OPTIONSSSS');
  console.log(options);


  options.is_cost = options.typeFeeCenter;
  options.limit = 100;

  if (options.fee_center_id || options.trans_id) {
    delete options.limit;
  }

  const filters = new FilterParser(options, { tableAlias : 'gl' });

  const sql = `
    SELECT fc.id, BUID(fc.trans_uuid) AS trans_uuid, fc.trans_id, fc.account_id, fc.is_cost,
    fc.auxiliary_fee_center_id, fc.principal_fee_center_id, fc.debit_equiv, fc.credit_equiv, fc.currency_id,
    fc.date_distribution, fc.user_id, gl.project_id, gl.fiscal_year_id, gl.period_id, gl.trans_date,
    gl.description, gl.transaction_type_id, BUID(gl.record_uuid) AS record_uuid, gl.entity_uuid,
    BUID(gl.reference_uuid) AS reference_uuid, ac.number AS account_number, ac.label AS account_label, gl.currency_id,
    aux.label AS fee_center_label, pri.label AS principal_label, dm1.text AS hrRecord, dm2.text AS hrReference, 
    u.display_name AS user_name
    FROM fee_center_distribution AS fc
    JOIN general_ledger AS gl ON gl.uuid = fc.trans_uuid
    JOIN account AS ac ON ac.id = gl.account_id
    JOIN fee_center AS aux ON aux.id = fc.auxiliary_fee_center_id
    JOIN fee_center AS pri ON pri.id = fc.principal_fee_center_id
    JOIN user AS u ON u.id = fc.user_id
    LEFT JOIN document_map dm1 ON dm1.uuid = gl.record_uuid
    LEFT JOIN document_map dm2 ON dm2.uuid = gl.reference_uuid
  `;

  filters.dateFrom('periodFrom', 'trans_date');
  filters.dateTo('periodTo', 'trans_date');
  filters.equals('trans_id');
  filters.equals('is_cost', 'is_cost', 'fc');
  filters.equals('fee_center_id', 'id', 'aux');
  filters.equals('account_id', 'account_id', 'fc');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then((rows) => {

      res.status(200).json(rows);
    })
    .catch(next);
}

exports.getDistributed = getDistributed;
