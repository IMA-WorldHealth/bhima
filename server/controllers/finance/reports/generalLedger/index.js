/**
 * @overview General Ledger Accounts Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of the general ledgers.
 * It should really use the same code as the accounts reports.
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const GeneralLedger = require('../../generalLedger');
const Tree = require('../../../../lib/Tree');

const REPORT_TEMPLATE = './server/controllers/finance/reports/generalLedger/report.handlebars';

exports.report = renderReport;

/**
 * GET reports/finance/general_ledger
 *
 * @method report
 */
function renderReport(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'TREE.GENERAL_LEDGER',
    orientation : 'landscape',
    csvKey   : 'rows',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let report;
  let data;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const fiscalYearId = options.fiscal_year_id;
  const TITLE_ACCOUNT_ID = 6;

  return GeneralLedger.getAccountTotalsMatrix(fiscalYearId)
    .then(rows => {
      const tree = new Tree(rows);

      tree.walk((node, parentNode) => {
        Tree.common.computeNodeDepth(node, parentNode);

        node.isTitleAccount = node.type_id === TITLE_ACCOUNT_ID;
        node.padLeft = node.depth * 15;
      });

      const keys = _.keys(rows[0])
        .filter(name => name.includes('balance'));

      const root = tree.getRootNode();
      const balances = root.children.reduce((aggregates, node) => {
        keys.forEach(key => {
          aggregates[key] = (aggregates[key] || 0) + node[key];
        });

        return aggregates;
      }, {});

      data = { rows : tree.toArray(), footer : balances };
      data.fiscal_year_label = options.fiscal_year_label;
      return report.render(data);
    })
    .then((result) => {
      if (result.headers.type === 'xlsx') {
        res.xls(result.headers.filename, result.report.rows);
      } else {
        res.set(result.headers).send(result.report);
      }
    })
    .catch(next)
    .done();
}
