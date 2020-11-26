const _ = require('lodash');
const Accounts = require('../../accounts');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/accounts/chart.handlebars';

/**
 * @method chart
 *
 * @description
 * Generate chart of account as a document
 */
function chart(req, res, next) {
  let report;

  const params = req.query;

  // @TODO Define server constants library
  const TITLE_ID = 6;

  params.user = req.session.user;
  params.TITLE_ID = TITLE_ID;

  const options = _.extend(req.query, {
    csvKey : 'accounts',
    filename : 'REPORT.CHART_OF_ACCOUNTS',
    orientation : 'landscape',
  });

  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  Accounts.lookupAccount()
    .then(Accounts.processAccountDepth)
    .then(accounts => report.render({ accounts }))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.chart = chart;
