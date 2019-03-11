const db = require('../../../lib/db');

module.exports.list = list;

function list(req, res, next) {
  const sql = `SELECT * FROM indictor_status`;
  db.exec(sql).then((rows) => {
    res.status(200).json(rows);
  }).catch(next);
}
