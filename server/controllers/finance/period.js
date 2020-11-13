// period API
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');

exports.list = list;
exports.details = details;
exports.lookupPeriodById = lookupPeriodById;

function list(req, res, next) {
  const params = req.query;
  const filters = new FilterParser(params, { tableAlias : 'p' });
  const query = `
    SELECT p.id, p.fiscal_year_id, p.number, p.start_date, p.end_date, p.locked,
      p.translate_key, p.year
    FROM period p
  `;

  filters.equals('fiscal_year_id');
  filters.period('number');
  filters.dateFrom('start_date');
  filters.dateTo('end_date');

  const sql = {
    query : filters.applyQuery(query),
    parameters : filters.parameters(),
  };

  db.exec(sql.query, sql.parameters)
    .then(periods => {
      res.status(200).json(periods);
    })
    .catch(next);
}

function lookupPeriodById(id) {
  const query = `
    SELECT p.id, p.fiscal_year_id, p.number, p.start_date, p.end_date, p.locked
    FROM period p WHERE id = ?;
  `;

  return db.one(query, [id]);
}

function details(req, res, next) {
  const { id } = req.params;
  lookupPeriodById(id)
    .then(period => {
      res.status(200).json(period);
    })
    .catch(next);
}
