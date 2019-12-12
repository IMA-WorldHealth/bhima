/**
 * Stock Requestor Type Controller
 */
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');

function find(options) {
  const sql = 'SELECT id, type_key, title_key FROM stock_requestor_type';
  const filters = new FilterParser(options);
  filters.equals('id', 'id');
  filters.equals('type_key', 'type_key');

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return db.exec(query, queryParameters);
}

function lookup(id) {
  const sql = 'SELECT id, type_key, title_key FROM stock_requestor_type WHERE id = ?';
  db.one(sql, [id]);
}

module.exports.list = (req, res, next) => {
  find(req.query)
    .then(rows => {
      res.status(200).json(rows);
    })
    .catch(next);
};

module.exports.details = (req, res, next) => {
  lookup(req.params.id)
    .then(row => {
      res.status(200).json(row);
    })
    .catch(next);
};
