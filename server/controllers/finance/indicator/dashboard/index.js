/**
 * indicators dashboard
 */
const moment = require('moment');
const process = require('./process');

exports.getIndicators = getIndicators;

async function getIndicators(req, res, next) {
  const options = req.query;
  options.dateFrom = moment(options.dateFrom).format('YYYY-MM-DD');
  options.dateTo = moment(options.dateTo).format('YYYY-MM-DD');
  process.processIndicators(options)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
}
