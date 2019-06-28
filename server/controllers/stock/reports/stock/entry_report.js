const {
  _, db, util, ReportManager, pdfOptions, STOCK_ENTRY_REPORT_TEMPLATE,
} = require('../common');

const StockEntryFromPurchase = require('./entry/entryFromPurchase');
const StockEntryFromIntegration = require('./entry/entryFromIntegration');
const StockEntryFromDonation = require('./entry/entryFromDonation');
const StockEntryFromTransfer = require('./entry/entryFromTransfer');

/**
   * @method stockEntryReport
   *
   * @description
   * This method builds the stock entry report as either a JSON, PDF, or HTML
   * file to be sent to the client.
   *
   * GET /reports/stock/entry
   */
function stockEntryReport(req, res, next) {
  let report;

  const params = util.convertStringToNumber(req.query);

  const optionReport = _.extend(params, pdfOptions, {
    filename : 'REPORT.STOCK.ENTRY_REPORT',
  });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_REPORT_TEMPLATE, req.session, optionReport);
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
function groupCollection(entryCollection) {
  const collection = {};

  // entry to purchase
  collection.entryFromPurchase = formatAndCombine(entryCollection.entryFromPurchase);

  // entry to integration
  collection.entryFromIntegration = formatAndCombine(entryCollection.entryFromIntegration);

  // entry to donation
  collection.entryFromDonation = formatAndCombine(entryCollection.entryFromDonation);

  // entry to transfer
  collection.entryFromTransfer = formatAndCombine(entryCollection.entryFromTransfer);

  return collection;
}

function formatAndCombine(data) {
  const aggregate = _.chain(data)
    .groupBy('text')
    .map(formatEntry)
    .value();

  return { data : aggregate, isEmpty : _.size(aggregate) === 0 };
}

/**
   * @function formatEntry
   */
function formatEntry(value, key) {
  return {
    inventory_name : key,
    inventory_unit : value && value[0] ? value[0].unit_text : '',
    inventory_stock_entry_data : value,
    inventory_stock_entry_quantity : _.sumBy(value, 'quantity'),
  };
}

/**
   * @function collect
   * @param {object} params query parameters
   * @return {promise} { entryFromPurchase: [], entryFromIntegration: [], entryFromDonation: [], entryFromTransfer: [] }
   */
async function collect(params) {
  const {
    depotUuid,
    dateFrom,
    dateTo,
    showDetails,
    includePurchaseEntry,
    includeIntegrationEntry,
    includeDonationEntry,
    includeTransferEntry,
  } = params;

  const data = {};

  // get stock entry from purchase
  if (includePurchaseEntry) {
    data.entryFromPurchase = await StockEntryFromPurchase.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock entry from integration
  if (includeIntegrationEntry) {
    data.entryFromIntegration = await StockEntryFromIntegration.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock entry from donation
  if (includeDonationEntry) {
    data.entryFromDonation = await StockEntryFromDonation.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  // get stock entry from transfer
  if (includeTransferEntry) {
    data.entryFromTransfer = await StockEntryFromTransfer.fetch(depotUuid, dateFrom, dateTo, showDetails);
  }

  return data;
}

module.exports = stockEntryReport;
