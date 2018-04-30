const {
  _, db, util, ReportManager, pdfOptions, STOCK_EXIT_REPORT_TEMPLATE,
} = require('../common');

const StockExitToPatient = require('./exit/exitToPatient');
const StockExitToService = require('./exit/exitToService');
const StockExitToDepot = require('./exit/exitToDepot');
const StockExitToLoss = require('./exit/exitToLoss');

/**
 * @method stockExitReport
 *
 * @description
 * This method builds the stock exit report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/exit
 */
function stockExitReport(req, res, next) {
  let report;

  const params = util.convertStringToNumber(req.query);

  const optionReport = _.extend(params, pdfOptions, {
    filename : 'REPORT.STOCK.EXIT_REPORT',
  });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return fetchDepotDetails(params.depotUuid)
    .then(depot => {
      params.depotName = depot.text;
      return collect(params);
    })
    .then(groupCollection)
    .then((bundle) => {
      _.extend(bundle, params);

      return report.render(bundle);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * fetchDepotDetails
 * @param {number} depotUuid depot uuid
 */
function fetchDepotDetails(depotUuid) {
  const query = 'SELECT text FROM depot WHERE uuid = ?';
  return db.one(query, [db.bid(depotUuid)]);
}

/**
 * @function groupCollection
 * @description group collected data by inventory
 */
function groupCollection(exitCollection) {
  const collection = {};

  // exit to patient
  collection.exitToPatient = formatAndCombine(exitCollection.exitToPatient);

  // exit to service
  collection.exitToService = formatAndCombine(exitCollection.exitToService);

  // exit to depot
  collection.exitToDepot = formatAndCombine(exitCollection.exitToDepot);

  // exit to loss
  collection.exitToLoss = formatAndCombine(exitCollection.exitToLoss);

  return collection;
}

function formatAndCombine(data) {
  const aggregate = _.chain(data)
    .groupBy('text')
    .map(formatExit)
    .value();

  return { data : aggregate, isEmpty : _.size(aggregate) === 0 };
}

/**
 * @function formatExit
 */
function formatExit(value, key) {
  return {
    inventory_name : key,
    inventory_unit : value && value[0] ? value[0].unit_text : '',
    inventory_stock_exit_data : value,
    inventory_stock_exit_quantity : _.sumBy(value, 'quantity'),
  };
}

/**
 * @function collect
 * @param {object} params query parameters
 * @return {promise} { exitToPatient: [], exitToService: [], exitToDepot: [], exitToLoss: [] }
 */
async function collect(params) {
  const {
    depotUuid,
    dateFrom,
    dateTo,
    showDetails,
    includePatientExit,
    includeServiceExit,
    includeDepotExit,
    includeLossExit,
  } = params;

  const data = {};

  // get stock exit to patient
  if (includePatientExit) {
    data.exitToPatient = await StockExitToPatient.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock exit to service
  if (includeServiceExit) {
    data.exitToService = await StockExitToService.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock exit to other depot
  if (includeDepotExit) {
    data.exitToDepot = await StockExitToDepot.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock exit to loss
  if (includeLossExit) {
    data.exitToLoss = await StockExitToLoss.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  return data;
}

module.exports = stockExitReport;
