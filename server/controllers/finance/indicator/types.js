const db = require('../../../lib/db');

exports.list = list;

function list(req, res, next) {
  const sql = `SELECT id, text, translate_key FROM indicator_type`;
  db.exec(sql).then((rows) => {
    res.status(200).json(rows);
  }).catch(next);
}
