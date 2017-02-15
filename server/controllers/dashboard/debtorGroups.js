const moment = require('moment');

const report = require('../finance/reports/debtors');

// time until the cached value expires - currently set at 5 minutes
const CACHE_TTL = 300000;

let cachedReport, timestamp;

exports.getReport = getReport;

function getReport(req, res, next) {
  let requestTime = new moment();

  // if the current request is made within the cache life - send the cached report
  if (timestamp) {
    if (requestTime.diff(timestamp) < CACHE_TTL) {
      res.status(200).send(formatResponse(cachedReport));
      return;
    }
  }

  // the cache has expired or has never been created - calculate the report
  // ensure the lastest data from both the posting journal and the general ledger
  // is used
  report.context({combinedLedger : 1})
    .then(function (result) {
      timestamp = new moment();
      cachedReport = result;
      res.status(200).send(formatResponse(result));
    });
}

function formatResponse(report) {
  return {
    data : report,
    timeCached : timestamp,
    cacheLength : CACHE_TTL
  };
}
