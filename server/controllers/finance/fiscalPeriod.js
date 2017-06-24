/**
 * @module fiscalPeriod
 *
 * @description
 * This controller is responsible for implementing all crud on the
 * fiscal year period trough the `/period` endpoint.
 * 
 * @requires moment
 * @requires db
 * @requires filter
 */


const moment = require('moment');
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');

const PERIOD_0_NUM = 0;
const PERIOD_13_NUM = 13;

exports.list = list;
exports.find = find;
exports.getPeriodDiff = getPeriodDiff;
exports.isInSameFiscalYear = isInSameFiscalYear;

/**
 * @method list
 *
 * @description
 * Returns an array of periods
 */
function list(req, res, next) {
  find(req.query)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
 * @method find
 *
 * @description
 * This function scans the period of fiscal year find all values
 * matching parameters provided in the options parameter.
 *
 * @param {Object} options - a JSON of query parameters
 * @returns {Promise} - the result of the promise query on the database.
 */
function find(options) {
  const sql =
    `
    SELECT 
      p.id, p.fiscal_year_id, p.number, p.start_date, p.end_date, CONCAT(IFNULL(p.start_date, p.number), '/',  IFNULL(p.end_date, p.number)) AS label
    FROM period AS p `;

  const filters = new FilterParser(options, { tableAlias : 'p', autoParseStatements : false });
  filters.equals('fiscal_year_id', 'fiscal_year_id', 'p');
  filters.equals('id', 'id', 'p');
  const exludePeriods = options.excludeExtremityPeriod === 'true';

  if(exludePeriods){
    filters.custom('excludeExtremityPeriod', `p.number NOT IN (${PERIOD_0_NUM}, ${PERIOD_13_NUM})`);
  }  

  // @TODO Support ordering query
  filters.setOrder('ORDER BY p.id ASC');

  // applies filters and limits to define sql, get parameters in correct order
  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();
  return db.exec(query, parameters);
}

function isInSameFiscalYear(opt){
  if(opt.periods.length !== 2){
    return false;
  }
  const sql = `
  SELECT 
    p.fiscal_year_id 
  FROM 
    period AS p`
  const filters = new FilterParser(opt, { tableAlias : 'p', autoParseStatements : false });
  filters.custom('periods', `p.id IN (${opt.periods.join(',')})`);
  const query = filters.applyQuery(sql);
  return db.exec(query)
    .then(function (res){
      const value = res.reduce(function (x, y){
        return x.fiscal_year_id === y.fiscal_year_id;
      });
      return value;
    });
}

function getPeriodDiff (periodIdA, periodIdB){ 
  let periodA;
  let periodB;

  return find({id : periodIdA})
    .then((pA) => {
      periodA = pA[0];
      return find({id : periodIdB})
    })
    .then((pB) => {
      periodB = pB[0];
      let date1 = moment(periodA.start_date).format('YYYY-MM-DD').toString();
      let date2 = moment(periodB.start_date).format('YYYY-MM-DD').toString();
      const sql = `SELECT DATEDIFF('${date1}','${date2}') AS nb`;
      return db.one(sql);
    });
}

