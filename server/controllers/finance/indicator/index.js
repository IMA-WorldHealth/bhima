const hospitalization = require('./hospitalization');
const personel = require('./personel');
const finances = require('./finances');
const status = require('./status');

const FilterParser = require('../../../lib/filter');
// module dependencies
const db = require('../../../lib/db');

module.exports.hospitalization = hospitalization;
module.exports.personel = personel;
module.exports.finances = finances;
module.exports.status = status;
module.exports.read = read;


// Indicator Variables Registry
function read(req, res, next) {
  const options = req.query;
  db.convert(options, ['uuid']);

  const filters = new FilterParser(options, { tableAlias : 'ind' });
  const sql = `
    SELECT BUID(ind.uuid), ind.period_id, p.start_date as periodStart, p.fiscal_year_id,
      f.label as fiscalYear, ins.translate_key as statusKey, ind.status_id , 
      ind.user_id, u.username, ind.type
    FROM indicator ind
    JOIN period p ON p.id = ind.period_id
    JOIN fiscal_year f ON f.id = p.fiscal_year_id
    JOIN user u ON u.id = ind.user_id
    JOIN indicator_status ins ON ins.id = ind.status_id
  `;
  filters.equals('user_id');
  filters.equals('status_id');
  filters.equals('period_id');
  filters.equals('type');
  filters.custom('fiscal_year_id', 'f.id=?');

  const resqt = {
    sql : filters.applyQuery(sql),
    parameters : filters.parameters(),
  };

  db.exec(resqt.sql, resqt.parameters).then(rows => {
    res.status(200).json(rows);
  }).catch(next);
}
