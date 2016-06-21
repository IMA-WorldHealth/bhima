'use strict';

const db = require('./../../lib/db');

// HTTP Controller
exports.availablePaymentPeriod = function (req, res, next) {
  const sql = `
    SELECT
      p.id, p.config_tax_id, p.config_rubric_id, p.config_accounting_id, p.config_cotisation_id,
      p.label, p.dateFrom, p.dateTo, r.label AS RUBRIC, t.label AS TAX, a.label AS account,
      c.label AS cotisation
    FROM
      paiement_period p, config_rubric r, config_tax t, config_accounting a,
      config_cotisation c
    WHERE p.config_tax_id = t.id
      AND p.config_rubric_id = r.id
      AND a.id=p.config_accounting_id
      AND p.config_cotisation_id = c.id
      ORDER BY p.id DESC
  `;

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.setTaxPayment = function (req, res, next) {
  var sql = `
    UPDATE tax_paiement SET posted = 1 ' +
    WHERE tax_paiement.paiement_uuid=${db.escape(req.body.paiement_uuid)}
      AND tax_paiement.tax_id = ${db.escape(req.body.tax_id)};
  `;

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};
