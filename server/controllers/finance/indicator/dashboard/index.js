/**
 * indicators dashboard
 */
const moment = require('moment');
const process = require('./process');

exports.getIndicators = getIndicators;
function getIndicators(req, res, next) {
  const options = req.query;
  lookupIndicators(options)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}

async function lookupIndicators(options) {
  options.dateFrom = moment(options.dateFrom).format('YYYY-MM-DD');
  options.dateTo = moment(options.dateTo).format('YYYY-MM-DD');
  return process.processIndicators(options);
}
