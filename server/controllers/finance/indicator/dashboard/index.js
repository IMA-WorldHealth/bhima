/**
 * indicators dashboard
 */
const moment = require('moment');
const process = require('./process');

exports.getIndicators = getIndicators;

async function getIndicators(req, res, next) {
  const options = req.query;

  // get year dates as default
  const dates = getDates(options);
  options.start_date = dates.startDate;
  options.end_date = dates.endDate;

  process.processIndicators(options)
    .then(indicators => {
      res.status(200).json(indicators);
    })
    .catch(next);
}

/**
 * getCurrentYearDates
 * this fn helps to get defaults dates values set to 01 jan and 31 dec of the current year
 */
function getDates(options) {
  console.log('options : ', options);
  const current = new Date();
  const year = current.getFullYear();

  options.start_date = options.start_date || new Date(`${year}-01-01`);
  options.end_date = options.end_date || new Date(`${year}-12-31`);

  return {
    startDate : moment(options.start_date).format('YYYY-MM-DD'),
    endDate : moment(options.end_date).format('YYYY-MM-DD'),
  };
}
