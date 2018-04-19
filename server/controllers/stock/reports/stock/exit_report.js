const Q = require('q');

const {
  _, ReportManager, pdfOptions, STOCK_EXIT_REPORT_TEMPLATE,
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

  let data = {};
  let params = {};
  const options = req.query;
  const optionReport = _.extend(options, pdfOptions, {
    filename : 'REPORT.STOCK.EXIT_REPORT',
  });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_REPORT_TEMPLATE, req.session, optionReport);
    params = JSON.parse(req.query.params);
  } catch (e) {
    return next(e);
  }

  /**
   * get into the data object :
   * - exitToPatient : stock exit to patient data
   * - exitToService : stock exit to service data
   * - exitToDepot : stock exit to depot data
   * - exitToLoss : stock exit as loss
   */
  try {
    data = collect(params);
  } catch (e) {
    return next(e);
  }

  return Q.fcall(() => data)
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
 * @function groupCollection
 * @description group collected data by inventory
 */
function groupCollection(exitCollection) {
  const collection = {};

  // exit to patient
  collection.exitToPatient = _.groupBy(exitCollection.exitToPatient, row => row.text);
  collection.exitToPatient = _.map(collection.exitToPatient, formatExit);
  collection.exitToPatientEmpty = (Object.keys(collection.exitToPatient).length === 0);

  // exit to service
  collection.exitToService = _.groupBy(exitCollection.exitToService, row => row.text);
  collection.exitToService = _.map(collection.exitToService, formatExit);
  collection.exitToServiceEmpty = (Object.keys(collection.exitToService).length === 0);

  // exit to depot
  collection.exitToDepot = _.groupBy(exitCollection.exitToDepot, row => row.text);
  collection.exitToDepot = _.map(collection.exitToDepot, formatExit);
  collection.exitToDepotEmpty = (Object.keys(collection.exitToDepot).length === 0);

  // exit to loss
  collection.exitToLoss = _.groupBy(exitCollection.exitToLoss, row => row.text);
  collection.exitToLoss = _.map(collection.exitToLoss, formatExit);
  collection.exitToLossEmpty = (Object.keys(collection.exitToLoss).length === 0);

  return collection;
}

/**
 * @function formatExit
 */
function formatExit(value, index) {
  return {
    inventory_name : index,
    inventory_unit : value && value[0] ? value[0].unit_text : '',
    inventory_stock_exit_data : value,
    inventory_stock_exit_quantity : _.sumBy(value, 'quantity'),
  };
}

/**
 * @function collect
 * @param {object} params query parameters
 * @return {object} { exitToPatient: [], exitToService: [], exitToDepot: [], exitToLoss: [] }
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

  try {
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

  } catch (error) {
    throw error;
  }

  return data;
}

module.exports = stockExitReport;
