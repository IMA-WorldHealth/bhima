const {
  _, ReportManager, SATISFACTION_RATE_REPORT_TEMPLATE,
} = require('../common');

const satisfaction = require('./satisfaction');

/**
 * satisfactionRateReport
 *
 * This method builds the satisfaction rate report as either a
 * JSON, PDF, or HTML file to be sent to the client.
 *
 * GET '/reports/stock/satisfaction_rate_report'
 *
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {object} next - next middleware object to pass control to
 */
function satisfactionRateReport(req, res, next) {

  reporting(req.query, req.session).then(result => {

    res.set(result.headers).send(result.report);
  }).catch(next);
}

async function reporting(_options, session) {
  const { dateFrom, dateTo } = _options;

  const optionReport = _.extend(_options, {
    filename : 'TREE.SATISFACTION_RATE_REPORT',
  });

  const report = new ReportManager(SATISFACTION_RATE_REPORT_TEMPLATE, session, optionReport);

  const { depotUuids } = optionReport;

  const data = await satisfaction.getSatisfactionData({ dateFrom, dateTo, depotUuids });

  optionReport.suppliersListe = data.suppliersList;
  data.option = optionReport;

  return report.render(data);
}

module.exports = satisfactionRateReport;
