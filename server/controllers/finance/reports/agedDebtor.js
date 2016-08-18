/**
 * @overview agedDebtor
 *
 * @description
 * This report displays the amounts owed by debtor groups broken down by age of
 * their debt.  The report highlights clients who have long overdue debts, so
 * that the administration can send out a recovery service to try and recover
 * the owed debt.
 *
 * The typical age categories are 0-30 days, 30-60 days, 60-90 days, and > 90
 * days.
 *
 * As usual, the reports are created with a handlebars template and shipped to
 * the client as either JSON, HTML, or PDF, depending on the renderer specified
 * in the HTTP query string.
 */

'use strict';

const _           = require('lodash');
const path        = require('path');

const db          = require('../../../lib/db');
const BadRequest  = require('../../../lib/errors/BadRequest');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

// default rendering parameters
const defaults = {
  pageSize: 'A4',
  renderer: 'pdf'
};

// path to the template to render
const template = path.normalize('./server/controllers/finance/reports/agedDebtor.handlebars');

/**
 * @method agedDebtorReport
 *
 * @description
 * The HTTP interface which actually creates the report.
 */
function agedDebtorReport(req, res, next) {

  const qs = req.query;

  // choose the renderer
  const renderer = renderers[qs.renderer || defaults.renderer];
  if (_.isUndefined(renderer)) {
    return next(new BadRequest(`The application does not support rendering ${qs.renderer}.`));
  }

  // data to be passed to the report
  const data = {
    metadata : {
      timestamp : new Date(),
      currency_id : req.session.enterprise.currency_id,
      user : req.session.user,
      enterprise : req.session.enterprise
    }
  };

  // make sure the language is set appropriately
  const context = { lang : qs.lang };
  _.defaults(context, defaults);

  // makes the
  const havingNonZeroValues = ' HAVING \'all\' > 0 ';
  const includeZeroes = Boolean(Number(qs.zeroes));

  // selects into columns of 30, 60, 90, and >90
  const debtorSql = `
    SELECT BUID(dg.uuid) AS id, dg.name, a.number,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 0 AND 30, gl.debit_equiv - gl.credit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 30 AND 60, gl.debit_equiv - gl.credit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 60 AND 90, gl.debit_equiv - gl.credit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) > 90, gl.debit_equiv - gl.credit_equiv, 0)) AS excess,
      SUM(gl.debit_equiv - gl.credit_equiv) AS 'all'
    FROM debtor_group AS dg JOIN debtor AS d ON dg.uuid = d.group_uuid
      LEFT JOIN general_ledger AS gl ON gl.entity_uuid = d.uuid
      JOIN account AS a ON a.id = dg.account_id
    GROUP BY dg.uuid
    ${includeZeroes ? '' : havingNonZeroValues}
    ORDER BY dg.name;
  `;

  // aggregates the data above as totals into columns of 30, 60, 90, and >90
  const aggregateSql = `
    SELECT
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 0 AND 30, gl.debit_equiv - gl.credit_equiv, 0)) AS thirty,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 30 AND 60, gl.debit_equiv - gl.credit_equiv, 0)) AS sixty,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) BETWEEN 60 AND 90, gl.debit_equiv - gl.credit_equiv, 0)) AS ninety,
      SUM(IF(DATEDIFF(CURRENT_TIMESTAMP(), gl.trans_date) > 90, gl.debit_equiv - gl.credit_equiv, 0)) AS excess,
      SUM(gl.debit_equiv - gl.credit_equiv) AS 'all'
    FROM debtor_group AS dg JOIN debtor AS d ON dg.uuid = d.group_uuid
      LEFT JOIN general_ledger AS gl ON gl.entity_uuid = d.uuid
    ${includeZeroes ? '' : havingNonZeroValues}
  `;

  // fire the SQL for the report
  db.exec(debtorSql)
    .then(function (debtors) {
      data.debtors = debtors;
      return db.exec(aggregateSql);
    })
    .then(aggregates => {
      data.aggregates = aggregates[0];
      return renderer.render(data, template, context);
    })
    .then(result => {
      res.set(renderer.headers).send(result);
    })
    .catch(next)
    .done();
}

module.exports = agedDebtorReport;
