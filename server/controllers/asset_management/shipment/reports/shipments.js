const _ = require('lodash');

const {
  ReportManager,
  formatFilters,
  shipment,
  SHIPMENTS_REPORT_TEMPLATE,
} = require('./common');

async function getReport(req, res, next) {
  let display = {};
  const params = req.query;
  const optionReport = _.extend(params, {
    filename : 'SHIPMENT.SHIPMENTS',
    csvKey : 'rows',
    renameKeys : false,
    orientation : 'landscape',
  });

  try {
    if (params.displayNames) {
      display = JSON.parse(params.displayNames);
      delete params.displayNames;
    }

    const report = new ReportManager(SHIPMENTS_REPORT_TEMPLATE, req.session, optionReport);
    const rows = await shipment.find(params);

    const data = {
      rows,
      display,
      filters : formatFilters(params),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

exports.getReport = getReport;
